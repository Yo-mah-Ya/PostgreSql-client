import type { PoolClient, QueryResult } from "pg";
import { Logger, errorMessageOf } from "../utils";
import { Query } from "./sql";
import { BaseTableSchemas } from "../entity";
import { deleteClient, DeleteClient } from "./delete";
import { insertClient, InsertClient } from "./insert";
import { selectClient, SelectClient } from "./select";
import { updateClient, UpdateClient } from "./update";
import { upsertClient, UpsertClient } from "./upsert";

export const execute = async (
    poolClient: PoolClient,
    query: Query,
    callSite?: Logger.CallSite
): Promise<QueryResult> => {
    try {
        return await poolClient.query(query.sql, query.values);
    } catch (error) {
        Logger.warn({
            message: errorMessageOf(error),
            callSite,
            query,
            error,
        });
        throw error;
    }
};

export type QueryClient<Schemas extends BaseTableSchemas> = {
    select: SelectClient;
    insertInto: InsertClient<Schemas>;
    update: UpdateClient<Schemas>;
    upsert: UpsertClient<Schemas>;
    delete: DeleteClient<Schemas>;
    rawSql: (
        poolClient: PoolClient,
        query: Query,
        callSite?: Logger.CallSite
    ) => Promise<QueryResult>;
};
export const queryClient = <T extends BaseTableSchemas>(
    tableSchemas: T
): QueryClient<T> =>
    ({
        select: selectClient(),
        insertInto: insertClient<T>(),
        update: updateClient<T>(),
        upsert: upsertClient(tableSchemas),
        delete: deleteClient<T>(),
        rawSql: (
            poolClient: PoolClient,
            query: Query,
            callSite?: Logger.CallSite
        ) => execute(poolClient, query, callSite),
    } as const);
