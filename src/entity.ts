import type { TypeOf, Mixed, Validation } from "io-ts";
import { PathReporter } from "io-ts/PathReporter";
import { isLeft } from "fp-ts/Either";

export type TableName<T> = T & string;
export type ColumnName<T> = T & string;
export type BaseTableSchema = {
    readonly schema: Mixed;
    readonly primaryKeys: ColumnName<keyof TypeOf<Mixed>>[];
    readonly uniqueKeys: ColumnName<keyof TypeOf<Mixed>>[][];
    readonly needWhenInsert: Mixed;
};
export type UpsertParam<
    S extends BaseTableSchema["schema"],
    T extends BaseTableSchema["needWhenInsert"]
> = Partial<Omit<TypeOf<S>, keyof TypeOf<T>>> & TypeOf<T>;
export type BaseTableSchemas = Readonly<Record<string, BaseTableSchema>>;

export const assertCodecWith = <A>(decoded: Validation<A>): A => {
    if (isLeft(decoded)) {
        throw Error(PathReporter.report(decoded).join("\n"));
    }
    return decoded.right;
};
