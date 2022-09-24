import type { PoolClient, QueryResult } from "pg";
import { execute } from "..";
import { values } from "./sql";
import type { BaseTableSchemas, TableName, UpsertParam } from "../../entity";

export type InsertClient<TS extends BaseTableSchemas> = <K extends keyof TS>(
    table: TableName<K>
) => {
    values: (
        poolClient: PoolClient,
        param:
            | UpsertParam<TS[K]["schema"], TS[K]["needWhenInsert"]>
            | UpsertParam<TS[K]["schema"], TS[K]["needWhenInsert"]>[]
    ) => Promise<QueryResult>;
};

export const insertClient =
    <TS extends BaseTableSchemas>(): InsertClient<TS> =>
    <K extends keyof TS>(table: TableName<K>) =>
        ({
            values: async (
                poolClient: PoolClient,
                param:
                    | UpsertParam<TS[K]["schema"], TS[K]["needWhenInsert"]>
                    | UpsertParam<TS[K]["schema"], TS[K]["needWhenInsert"]>[]
            ) =>
                await execute(
                    poolClient,
                    values(poolClient.escapeIdentifier(table), param),
                    {
                        file: __filename,
                        function: "values function in insertClient",
                    }
                ),
        } as const);
