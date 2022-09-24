import type { PoolClient, QueryResult } from "pg";
import { execute } from "..";
import { escapeIdentifier, Query } from "../sql";
import { ObjectUtil } from "../../utils";
import type { TableSchema, TableSchemas, Column, Table } from "../../entity";
import { whereClause, WhereClause, LogicalOperation } from "../where";

const selectAll = async <T extends TableSchema>(
    client: PoolClient,
    query: Query
): Promise<T[]> =>
    (await execute(client, query)).rows.map(
        (row) => ObjectUtil.omitNullish(row as TableSchema) as T
    );

const selectOne = async <T extends TableSchema>(
    client: PoolClient,
    query: Query
): Promise<T | undefined> => {
    const { rows } = await execute(client, query);
    return rows.length === 1
        ? (ObjectUtil.omitNullish(rows[0] as TableSchema) as T)
        : undefined;
};

const groupBy =
    <T extends TableSchema, K extends keyof T>() =>
    (columns: Column<K>[]): string =>
        `GROUP BY ${columns
            .map((column) => escapeIdentifier(column))
            .join(", ")}`;
const select =
    <T extends TableSchema, K extends keyof T>() =>
    (columns: Column<K>[]): string =>
        `SELECT ${columns
            .map((column) => escapeIdentifier(column))
            .join(`, `)}`;

class Select<T extends TableSchema> {
    #conditions: {
        select?: string;
        from?: string;
        where?: string;
        groupBy?: string;
    } = {};
    constructor(table: string) {
        this.#conditions.from = `FROM ${table}`;
    }
    getSql = (): string =>
        `${this.#conditions.select ?? ""} ${this.#conditions.from ?? ""} ${
            this.#conditions.where ?? ""
        } ${this.#conditions.groupBy ?? ""}`;
    select = <K extends keyof T>(columns: Column<K>[]): Select<T> => {
        this.#conditions.select = select<T, K>()(columns);
        return this;
    };
    where = (func: (w: WhereClause<T>) => LogicalOperation<T>): Select<T> => {
        this.#conditions.where = func(whereClause<T>()).toWhereSql();
        return this;
    };
    groupBy = <K extends keyof T>(columns: Column<K>[]): Select<T> => {
        this.#conditions.groupBy = groupBy<T, Column<keyof T>>()(columns);
        return this;
    };
    execute = async (client: PoolClient): Promise<QueryResult> =>
        await execute(client, {
            sql: this.getSql(),
            values: [],
        });
}
export const selectClient = <Schemas extends TableSchemas>() =>
    ({
        from: <T extends keyof Schemas>(table: Table<T>) =>
            new Select<Schemas[T]>(escapeIdentifier(table)),
        selectAll,
        selectOne,
    } as const);
