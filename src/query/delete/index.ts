import type { PoolClient, QueryResult } from "pg";
import type { TypeOf } from "io-ts";
import { execute } from "..";
import { createDeleteQuery } from "./sql";
import type { BaseTableSchemas, TableName } from "../../entity";

export type DeleteClient<TS extends BaseTableSchemas> = <K extends keyof TS>(
    poolClient: PoolClient,
    table: TableName<K>,
    param: Partial<TypeOf<TS[K]["schema"]>>
) => Promise<QueryResult>;

export const deleteClient =
    <TS extends BaseTableSchemas>(): DeleteClient<TS> =>
    async <K extends keyof TS>(
        poolClient: PoolClient,
        table: TableName<K>,
        where: Partial<TypeOf<TS[K]["schema"]>>
    ) =>
        await execute(
            poolClient,
            createDeleteQuery(poolClient.escapeIdentifier(table), where),
            {
                file: __filename,
                function: "set function in deleteClient",
            }
        );
