import type { PoolClient } from "pg";
import { execute } from "..";
import { ObjectUtil } from "../../utils";
import { createBulkInsertQuery, createInsertQuery } from "./sql";
import type { TableSchemas, Table } from "../../entity";

type NonEmptyArray<T> = [T, ...T[]];

export const insertClient = <T extends TableSchemas>() =>
    ({
        into: <K extends keyof T>(table: Table<K>) => ({
            insert: async (client: PoolClient, param: T[Table<K>]) =>
                await execute(
                    client,
                    createInsertQuery(
                        client.escapeIdentifier(table),
                        ObjectUtil.nullishToNull(param)
                    )
                ),
            bulkInsert: async (
                client: PoolClient,
                param: NonEmptyArray<T[K]>
            ) =>
                await execute(
                    client,
                    createBulkInsertQuery(client.escapeIdentifier(table), param)
                ),
        }),
    } as const);
