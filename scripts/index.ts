import { Pool, PoolConfig } from "pg";
import { mkdir, rm, writeFile } from "fs/promises";
import { EOL } from "os";
import prettier from "prettier";

const formatAndWrite = async (
    filePath: string,
    data: string
): Promise<void> => {
    await writeFile(
        filePath,
        prettier.format(data, {
            tabWidth: 4,
            parser: "typescript",
        })
    );
};

const dbColumTypeToIoTsType = (postgresType: string): string =>
    ({
        smallint: "t.number",
        integer: "t.Integer",
        bigint: "t.BigIntType",
        decimal: "t.number",
        numeric: "t.number",
        real: "t.number",
        "double precision": "t.number",
        smallserial: "t.Integer",
        serial: "t.Integer",
        bigserial: "t.Integer",
        // Character Types
        "character varying": "t.string",
        varchar: "t.string",
        character: "t.string",
        char: "t.string",
        text: "t.string",
        // Boolean Type
        boolean: "t.boolean",
        // Date/Time Types
        timestamp: "t.string",
        "timestamp without time zone": "t.string",
        "timestamp with time zone": "t.string",
        date: "t.string",
        time: "t.string",
        "time without time zone": "t.string",
        "time with time zone": "t.string",
        interval: "t.string",
        // Text Search Types
        tsvector: "t.string",
        tsquery: "t.string",
        // Array
        ARRAY: "t.array(t.unknown)",
    }[postgresType] ?? "t.unknown");

type InformationSchemaQueryResult = {
    table_name: string;
    column_name: string;
    column_default: string;
    is_nullable: string;
    data_type: string;
    constraint_name: string;
    constraint_type: string;
};
const buildTableCodecFrom = (
    table: string,
    rows: (InformationSchemaQueryResult & Record<string, unknown>)[]
): string => {
    const primaryKey = rows
        .filter((r) => r.constraint_type === "PRIMARY KEY")
        .map((r) => `"${r.column_name}"`);
    const uniqueKeys = Object.values(
        rows
            .filter((r) => r.constraint_type === "")
            .reduce((a, r) => {
                if (!(r.constraint_name in a)) {
                    a[r.constraint_name] = [];
                }
                a[r.constraint_name].push(`"${r.column_name}"`);
                return a;
            }, {} as Record<string, string[]>)
    );
    const columTypeBuilderHelper = (
        a: Record<string, string>,
        r: InformationSchemaQueryResult
    ): Record<string, string> => ({
        ...a,
        [r.column_name]: dbColumTypeToIoTsType(r.data_type),
    });

    const notNull = rows
        .filter((r) => r.is_nullable === "NO")
        .reduce(columTypeBuilderHelper, {});
    const nullable = rows
        .filter((r) => r.is_nullable === "YES")
        .reduce(columTypeBuilderHelper, {});
    const needWhenInsert = rows
        .filter((r) => r.is_nullable === "NO" && r.column_default === null)
        .reduce(columTypeBuilderHelper, {});
    const columnDefault = rows
        .filter((r) => r.column_default !== null)
        .reduce(
            (a, r) => ({
                ...a,
                [r.column_name]: r.column_default,
            }),
            {} as Record<string, string>
        );
    const capitalizedTableName = table[0].toUpperCase() + table.slice(1);
    return `
        import * as t from "io-ts";
        import { TableSchema } from "../base/type";

        const ${table}_notNull = t.type(
            ${JSON.stringify(notNull).replace(/"/gi, "")}
        );
        const ${table}_nullable = t.partial(
            ${JSON.stringify(nullable).replace(/"/gi, "")}
        );
        const ${table}_schema = t.intersection([
            ${table}_notNull,
            ${table}_nullable
        ]);
        const ${table}_needWhenInsert = t.type(
            ${JSON.stringify(needWhenInsert).replace(/"/gi, "")}
        );
        type ${capitalizedTableName}Schema = t.TypeOf<typeof ${table}_schema>;
        export const is${capitalizedTableName}Schema = (u: unknown): u is ${capitalizedTableName}Schema => ${table}_schema.is(u);
        export const decodeWith${capitalizedTableName}Schema = (
            u: unknown
        ): t.Validation<${capitalizedTableName}Schema> => ${table}_schema.decode(u);

        export const ${table}: TableSchema<
            typeof ${table}_schema,
            typeof ${table}_needWhenInsert
        > = {
            schema: ${table}_schema,
            primaryKeys: [${
                primaryKey.length > 0 ? primaryKey.join(", ") : ""
            }],
            uniqueKeys: [${
                uniqueKeys.length > 0
                    ? uniqueKeys.map((u) => `[${u.join(", ")}]`).join(", ")
                    : ""
            }],
            needWhenInsert: ${table}_needWhenInsert,
            columnDefault: ${JSON.stringify(columnDefault)}
        };
    `;
};

const prepareOutputDirectories = async ({
    outputDir,
    baseDir,
    schemasDir,
}: {
    outputDir: string;
    baseDir: string;
    schemasDir: string;
}): Promise<void> => {
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(baseDir, { recursive: true });
    await mkdir(schemasDir, { recursive: true });
};
export const main = async ({
    poolConfig,
    postgresSchema = "public",
    outputDir,
}: {
    poolConfig: PoolConfig;
    postgresSchema: string;
    outputDir: string;
}): Promise<void> => {
    const pool = new Pool({
        ...poolConfig,
        max: 1,
    });

    const poolClient = await pool.connect();

    const baseDir = `${outputDir}/base`;
    const schemasDir = `${outputDir}/schemas`;
    console.log({
        outputDir,
        baseDir,
        schemasDir,
    });
    await prepareOutputDirectories({ outputDir, baseDir, schemasDir });

    await formatAndWrite(
        `${baseDir}/type.ts`,
        `import type { TypeOf, Mixed } from "io-ts";

        export type TableName<T> = T & string;
        export type ColumnName<T> = T & string;
        export type TableSchema<T extends Mixed, NeedWhenInsert extends Mixed> = {
            readonly schema: T;
            readonly primaryKeys: ColumnName<keyof TypeOf<T>>[];
            readonly uniqueKeys: ColumnName<keyof TypeOf<T>>[][];
            readonly needWhenInsert: NeedWhenInsert;
            readonly columnDefault: {
                [K in keyof TypeOf<T>]?: string;
            };
        };`
    );

    const { rows } = await poolClient.query(
        `SELECT
            c.table_name,
            c.column_name,
            c.column_default,
            c.is_nullable,
            c.data_type,
            tc.constraint_name,
            tc.constraint_type
        FROM information_schema.columns AS c
        LEFT JOIN information_schema.constraint_column_usage AS ccu
            ON c.table_catalog = ccu.table_catalog
                AND c.table_schema = ccu.table_schema
                AND c.table_name = ccu.table_name
                AND c.column_name = ccu.column_name
        LEFT JOIN information_schema.table_constraints AS tc
            ON tc.table_catalog = ccu.table_catalog
                AND tc.table_schema = ccu.table_schema
                AND tc.table_name = ccu.table_name
                AND tc.constraint_catalog = ccu.constraint_catalog
                AND tc.constraint_schema = ccu.constraint_schema
                AND tc.constraint_name = ccu.constraint_name
        WHERE c.table_schema = $1;`,
        [postgresSchema]
    );
    const tables = [
        ...new Set(rows.map((r: { table_name: string }) => r.table_name)),
    ];
    await Promise.all(
        tables.map((table_name) =>
            formatAndWrite(
                `${schemasDir}/${table_name}.ts`,
                buildTableCodecFrom(
                    table_name,
                    rows.filter(
                        (r: { table_name: string }) =>
                            r.table_name === table_name
                    ) as (InformationSchemaQueryResult &
                        Record<string, unknown>)[]
                )
            )
        )
    );

    await formatAndWrite(
        `${outputDir}/index.ts`,
        `${tables
            .map(
                (tablename) =>
                    `import { ${tablename} } from "./schemas/${tablename}";`
            )
            .join(EOL)}${EOL}
        export const tablesSchemas = {
            ${tables.join(`,${EOL}`)}
        } as const;
        export type TableSchemas = typeof tablesSchemas;`
    );
    poolClient.release(true);
};
