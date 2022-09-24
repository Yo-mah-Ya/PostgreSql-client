import type { PoolClient, QueryResult } from "pg";
import { execute } from "..";
import type { TableSchemas, TableSchema, Table } from "../../entity";
import { escapeIdentifier } from "../sql";
import { whereClause, WhereClause, LogicalOperation } from "../where";

class Delete<T extends TableSchema> {
    conditions: string[];
    constructor(sql: string) {
        this.conditions = [sql];
    }
    join = (): string => this.conditions.join(" ");
    where = (func: (w: WhereClause<T>) => LogicalOperation<T>): Delete<T> => {
        this.conditions.push(`${func(whereClause<T>()).toWhereSql()}`);
        return this;
    };
    execute = async (client: PoolClient): Promise<QueryResult> =>
        await execute(client, {
            sql: `DELETE FROM ${this.join()}`,
            values: [],
        });
}
export const deleteClient = <Schemas extends TableSchemas>() =>
    ({
        from: <T extends keyof Schemas>(table: Table<T>) =>
            new Delete<Schemas[T]>(escapeIdentifier(table)),
    } as const);
