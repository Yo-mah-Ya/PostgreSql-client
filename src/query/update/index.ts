import type { PoolClient, QueryResult } from "pg";
import type { TypeOf } from "io-ts";
import { execute } from "..";
import { createUpdateQuery } from "./sql";
import type { BaseTableSchemas, TableName } from "../../entity";

export type UpdateClient<TS extends BaseTableSchemas> = <K extends keyof TS>(
    table: TableName<K>
) => {
    set: (
        poolClient: PoolClient,
        param: Partial<TypeOf<TS[K]["schema"]>>
    ) => Promise<QueryResult>;
};

export const updateClient =
    <TS extends BaseTableSchemas>(): UpdateClient<TS> =>
    <K extends keyof TS>(table: TableName<K>) =>
        ({
            set: async (
                poolClient: PoolClient,
                param: Partial<TypeOf<TS[K]["schema"]>>
            ) =>
                await execute(
                    poolClient,
                    createUpdateQuery(
                        poolClient.escapeIdentifier(table),
                        param
                    ),
                    {
                        file: __filename,
                        function: "set function in updateClient",
                    }
                ),
        } as const);
