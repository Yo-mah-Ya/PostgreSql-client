import type { PoolClient, QueryResult } from "pg";
import type { TypeOf } from "io-ts";
import { execute } from "..";
import { values } from "../insert/sql";
import { selectClient } from "../select";
import { createUpdateQuery } from "../update/sql";
import {
    assertCodecWith,
    BaseTableSchemas,
    TableName,
    UpsertParam,
} from "../../entity";
import { ObjectUtil } from "../../utils";

export type UpsertClient<TS extends BaseTableSchemas> = <K extends keyof TS>(
    table: TableName<K>,
    poolClient: PoolClient,
    param: {
        param: UpsertParam<TS[K]["schema"], TS[K]["needWhenInsert"]>;
        where: Partial<TypeOf<TS[K]["schema"]>>;
    }
) => Promise<QueryResult>;

export const upsertClient =
    <TS extends BaseTableSchemas>(tableSchemas: TS): UpsertClient<TS> =>
    async <K extends keyof TS>(
        table: TableName<K>,
        poolClient: PoolClient,
        {
            param,
            where,
        }: {
            param: UpsertParam<TS[K]["schema"], TS[K]["needWhenInsert"]>;
            where: Partial<TypeOf<TS[K]["schema"]>>;
        }
    ) => {
        const upsert: Record<string, unknown> = assertCodecWith(
            tableSchemas[table].needWhenInsert.decode(param)
        ) as TypeOf<TS[K]["needWhenInsert"]>;
        const whereColumns = Object.keys(where);

        const rows = await selectClient().selectAll<{ count: number }>(
            poolClient,
            {
                sql: `SELECT COUNT(*)::INT AS count FROM ${poolClient.escapeIdentifier(
                    table
                )} ${
                    whereColumns.length
                        ? `WHERE ${whereColumns
                              .map((c, i) => `${c} = $${i + 1}`)
                              .join(" AND ")}`
                        : ""
                };`,
                values: Object.values(ObjectUtil.nullishToNull(where)),
            }
        );
        if (rows[0]?.count) {
            return await execute(
                poolClient,
                createUpdateQuery(
                    poolClient.escapeIdentifier(table),
                    upsert,
                    where
                ),
                {
                    file: __filename,
                    function: upsertClient.name,
                    line: "createUpdateQuery",
                }
            );
        } else {
            return await execute(
                poolClient,
                values(poolClient.escapeIdentifier(table), upsert),
                {
                    file: __filename,
                    function: upsertClient.name,
                    line: "values in insertClient",
                }
            );
        }
    };
