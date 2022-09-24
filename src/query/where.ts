import { escapeIdentifier } from "./sql";
import type { TableSchema, Column } from "../entity";

type NonEmptyArray<T> = [T, ...T[]];
type LogicalKeyword = "NOT" | "AND" | "OR";
type Between<T> = { from: T; to: T };

export class LogicalOperation<T extends TableSchema> {
    conditions: string[];
    constructor(sql: string) {
        this.conditions = [sql];
    }
    #bracket =
        (operation: LogicalKeyword) =>
        (
            func: (w: WhereClause<T>) => LogicalOperation<T>
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${bracket(func)}`);
            return this;
        };
    #eq =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${eq(column, value)}`);
            return this;
        };
    #neq =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${neq(column, value)}`);
            return this;
        };
    #In =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: NonEmptyArray<T[K]>
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${In(column, value)}`);
            return this;
        };
    #notIn =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: NonEmptyArray<T[K]>
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${notIn(column, value)}`);
            return this;
        };
    #ge =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${ge(column, value)}`);
            return this;
        };
    #gt =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${gt(column, value)}`);
            return this;
        };
    #le =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${le(column, value)}`);
            return this;
        };
    #lt =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${lt(column, value)}`);
            return this;
        };
    #between =
        (operation: LogicalKeyword) =>
        <K extends Column<keyof T>>(
            column: K,
            value: Between<T[K]>
        ): LogicalOperation<T> => {
            this.conditions.push(`${operation} ${between(column, value)}`);
            return this;
        };
    toWhereSql = (): string => `WHERE ${this.conditions.join(" ")}`;
    join = (): string => this.conditions.join(" ");

    notBracket = this.#bracket("NOT");
    notEq = this.#eq("NOT");
    notNeq = this.#neq("NOT");
    notIn = this.#In("NOT");
    notNotIn = this.#notIn("NOT");
    notGe = this.#ge("NOT");
    notGt = this.#gt("NOT");
    notLe = this.#le("NOT");
    notLt = this.#lt("NOT");
    notBetween = this.#between("NOT");

    andBracket = this.#bracket("AND");
    andEq = this.#eq("AND");
    andNeq = this.#neq("AND");
    andIn = this.#In("AND");
    andNotIn = this.#notIn("NOT");
    andGe = this.#ge("AND");
    andGt = this.#gt("AND");
    andLe = this.#le("AND");
    andLt = this.#lt("AND");
    andBetween = this.#between("NOT");

    orBracket = this.#bracket("OR");
    orEq = this.#eq("OR");
    orNeq = this.#neq("OR");
    orIn = this.#In("OR");
    orNotIn = this.#notIn("OR");
    orGe = this.#ge("AND");
    orGt = this.#gt("AND");
    orLe = this.#le("AND");
    orLt = this.#lt("AND");
    orBetween = this.#between("NOT");
}

const escape = <T>(value: T): string =>
    typeof value === "string" ? escapeIdentifier(value) : String(value);
const bracket = <T extends TableSchema>(
    func: (w: WhereClause<T>) => LogicalOperation<T>
): string => `(${func(whereClause<T>()).join()})`;
const eq = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: T[K]
): string => `${escapeIdentifier(column)} = ${escape(value)}`;
const neq = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: T[K]
): string => `${escapeIdentifier(column)} <> ${escape(value)}`;
const In = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: NonEmptyArray<T[K]>
): string =>
    `${escapeIdentifier(column)} IN (${value
        .map((v) => escape(v))
        .join(", ")})`;
const notIn = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: NonEmptyArray<T[K]>
): string =>
    `${escapeIdentifier(column)} NOT IN (${value
        .map((v) => escape(v))
        .join(", ")})`;
const ge = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: T[K]
): string => `${escapeIdentifier(column)} >= ${escape(value)}`;
const gt = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: T[K]
): string => `${escapeIdentifier(column)} > ${escape(value)}`;
const le = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: T[K]
): string => `${escapeIdentifier(column)} <= ${escape(value)}`;
const lt = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: T[K]
): string => `${escapeIdentifier(column)} < ${escape(value)}`;
const between = <T extends TableSchema, K extends Column<keyof T>>(
    column: K,
    value: Between<T[K]>
): string =>
    `${escapeIdentifier(column)} BETWEEN ${escape(value.from)} AND ${escape(
        value.to
    )}`;

export type WhereClause<T extends TableSchema> = Readonly<{
    bracket: <T extends TableSchema>(
        func: (w: WhereClause<T>) => LogicalOperation<T>
    ) => LogicalOperation<T>;
    eq: <K extends Column<keyof T>>(
        column: K,
        value: T[K]
    ) => LogicalOperation<T>;
    neq: <K extends Column<keyof T>>(
        column: K,
        value: T[K]
    ) => LogicalOperation<T>;
    In: <K extends Column<keyof T>>(
        column: K,
        value: NonEmptyArray<T[K]>
    ) => LogicalOperation<T>;
    notIn: <K extends Column<keyof T>>(
        column: K,
        value: NonEmptyArray<T[K]>
    ) => LogicalOperation<T>;
    ge: <K extends Column<keyof T>>(
        column: K,
        value: T[K]
    ) => LogicalOperation<T>;
    gt: <K extends Column<keyof T>>(
        column: K,
        value: T[K]
    ) => LogicalOperation<T>;
    le: <K extends Column<keyof T>>(
        column: K,
        value: T[K]
    ) => LogicalOperation<T>;
    lt: <K extends Column<keyof T>>(
        column: K,
        value: T[K]
    ) => LogicalOperation<T>;
    between: <K extends Column<keyof T>>(
        column: K,
        value: Between<T[K]>
    ) => LogicalOperation<T>;
}>;
export const whereClause = <T extends TableSchema>(): WhereClause<T> =>
    ({
        bracket: <T extends TableSchema>(
            func: (w: WhereClause<T>) => LogicalOperation<T>
        ): LogicalOperation<T> => new LogicalOperation(bracket(func)),
        eq: <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => new LogicalOperation(eq(column, value)),
        neq: <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => new LogicalOperation(neq(column, value)),
        In: <K extends Column<keyof T>>(
            column: K,
            value: NonEmptyArray<T[K]>
        ): LogicalOperation<T> => new LogicalOperation(In(column, value)),
        notIn: <K extends Column<keyof T>>(
            column: K,
            value: NonEmptyArray<T[K]>
        ): LogicalOperation<T> => new LogicalOperation(notIn(column, value)),
        ge: <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => new LogicalOperation(ge(column, value)),
        gt: <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => new LogicalOperation(gt(column, value)),
        le: <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => new LogicalOperation(le(column, value)),
        lt: <K extends Column<keyof T>>(
            column: K,
            value: T[K]
        ): LogicalOperation<T> => new LogicalOperation(lt(column, value)),
        between: <K extends Column<keyof T>>(
            column: K,
            value: Between<T[K]>
        ): LogicalOperation<T> => new LogicalOperation(between(column, value)),
    } as const);
