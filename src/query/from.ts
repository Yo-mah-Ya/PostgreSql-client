import type { TableSchemas, Table } from "../entity";
import { escapeIdentifier } from "./sql";

class Joiner<Schemas extends TableSchemas> {
    conditions: string[];
    constructor(table: string) {
        this.conditions = [table];
    }
    innerJoin = <T extends Table<keyof Schemas>>(table: T): Joiner<Schemas> => {
        this.conditions.push(`INNER JOIN ${escapeIdentifier(table)}`);
        return this;
    };
    join = (): string => this.conditions.join(" ");
}

type FromClause<Schemas extends TableSchemas> = {
    from: (table: Table<keyof Schemas>) => Joiner<Schemas>;
};
export const fromClause = <
    Schemas extends TableSchemas
>(): FromClause<Schemas> =>
    ({
        from: (table: Table<keyof Schemas>) => new Joiner<Schemas>(table),
    } as const);

export const from = <Schemas extends TableSchemas>(
    func: (w: FromClause<Schemas>) => Joiner<Schemas>
): unknown => func(fromClause<Schemas>());
