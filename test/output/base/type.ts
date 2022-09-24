import type { TypeOf, Mixed } from "io-ts";

export type TableName<T> = T & string;
export type ColumnName<T> = T & string;
export type TableSchema<T extends Mixed, NeedWhenInsert extends Mixed> = {
    readonly schema: T;
    readonly primaryKeys: ColumnName<keyof TypeOf<T>>[];
    readonly uniqueKeys: ColumnName<keyof TypeOf<T>>[][];
    readonly needWhenInsert: NeedWhenInsert;
    readonly columnDefault: {
        [K in keyof TypeOf<T>]?: string;
    };
};
