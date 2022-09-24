import type { PoolClient, QueryResult } from "pg";
import { Logger, errorMessageOf } from "../utils";
import { Query } from "./sql";
import { TableSchemas } from "../entity";
import { insertClient } from "./insert";
import { selectClient } from "./select";
import { deleteClient } from "./delete";

export const execute = async (
    client: PoolClient,
    query: Query,
    callSite?: Logger.CallSite
): Promise<QueryResult> => {
    try {
        return await client.query(query.sql, query.values);
    } catch (error) {
        Logger.warn({
            message: errorMessageOf(error),
            callSite,
        });
        throw error;
    }
};

export const queryClient = <Schemas extends TableSchemas>() =>
    ({
        select: selectClient<Schemas>(),
        insert: insertClient<Schemas>(),
        delete: deleteClient<Schemas>(),
    } as const);
