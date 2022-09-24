import { PoolClient, types } from "pg";
import TypeOverrides from "pg/lib/type-overrides";
import { postgreSql } from "../src";
// import { assertGetEnvValueFrom } from "../src/utils";
import { tablesSchemas } from "./output";

describe("postgreSql", () => {
    const typeOverrides = new TypeOverrides();
    [
        types.builtins.DATE,
        types.builtins.TIME,
        types.builtins.TIMESTAMP,
        types.builtins.TIMESTAMPTZ,
    ].forEach((oid) => {
        typeOverrides.setTypeParser(oid, (stringValue) => {
            return new Date(stringValue).toISOString();
        });
    });
    const client = postgreSql(
        // {
        //     host: assertGetEnvValueFrom("POSTGRESQL_HOST"),
        //     port: Number(assertGetEnvValueFrom("POSTGRES_PORT")),
        //     database: assertGetEnvValueFrom("POSTGRES_DB"),
        //     user: assertGetEnvValueFrom("POSTGRESQL_USER"),
        //     password: assertGetEnvValueFrom("POSTGRESQL_PASSWORD"),
        // }
        {
            host: "localhost",
            port: 5432,
            database: "dvdrental",
            user: "postgres",
            password: "password",
            types: typeOverrides,
            max: 10,
        },
        tablesSchemas
    );
    afterAll(async () => {
        await client.poolClient.pool.end();
    });

    const TEST_ID = 1000;
    const selectAllWith = <T extends Record<string, unknown>>(
        poolClient: PoolClient
    ): Promise<T[]> =>
        client.queryClient.select.selectAll(poolClient, {
            sql: "SELECT * FROM actor WHERE id = $1;",
            values: [TEST_ID],
        });
    const selectOneWith = async <T extends Record<string, unknown>>(
        poolClient: PoolClient
    ): Promise<T | undefined> =>
        await client.queryClient.select.selectOne(poolClient, {
            sql: "SELECT * FROM actor WHERE id = $1;",
            values: [TEST_ID],
        });

    test("select", async () => {
        await client.poolClient.autoTransaction(async (poolClient) => {
            expect(await selectAllWith(poolClient)).toStrictEqual([]);
            expect(await selectOneWith(poolClient)).toBeUndefined();
        });
    });
    test("upsert", async () => {
        await client.poolClient.autoTransaction(async (poolClient) => {
            const baseData = {
                id: TEST_ID,
                first_name: "Penelope",
                last_name: "Guiness",
                last_update: "2013-05-26T21:47:57.620Z",
            };
            await client.queryClient
                .insertInto("actor")
                .values(poolClient, baseData);
            expect(await selectOneWith(poolClient)).toStrictEqual(baseData);

            const lastUpdate = "2020-01-01T15:30:50.620Z";
            await client.queryClient.upsert("actor", poolClient, {
                param: {
                    first_name: baseData.first_name,
                    last_name: baseData.last_name,
                    last_update: lastUpdate,
                },
                where: {
                    first_name: baseData.first_name,
                    last_name: baseData.last_name,
                },
            });
            expect(
                await client.queryClient.select.selectAll(poolClient, {
                    sql: "SELECT * FROM actor WHERE first_name = $1 AND last_name = $2;",
                    values: [baseData.first_name, baseData.last_name],
                })
            ).toStrictEqual([
                {
                    ...baseData,
                    id: 1,
                    last_update: lastUpdate,
                },
                {
                    ...baseData,
                    last_update: lastUpdate,
                },
            ]);
            await client.queryClient.upsert("actor", poolClient, {
                param: {
                    first_name: baseData.first_name,
                    last_name: baseData.last_name,
                    last_update: baseData.last_update,
                },
                where: {
                    first_name: baseData.first_name,
                    last_name: baseData.last_name,
                },
            });

            // delete
            await client.queryClient.rawSql(poolClient, {
                sql: `DELETE FROM ${poolClient.escapeIdentifier(
                    "actor"
                )} WHERE id = $1;`,
                values: [TEST_ID],
            });
        });
    });
});
