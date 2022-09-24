import type { TypeOf } from "io-ts";
import { ObjectUtil } from "../../utils";
import type { Query } from "../sql";
import type { BaseTableSchema } from "../../entity";

const createInsertQuery = <T extends BaseTableSchema["schema"]>(
    table: string,
    record: TypeOf<T>
): Query => {
    const columns = Object.keys(record);
    return {
        sql: `INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns
            .map((_, index) => `$${index + 1}`)
            .join(",")});`,
        values: Object.values(ObjectUtil.nullishToNull(record)),
    };
};

const createBulkInsertQuery = <T extends BaseTableSchema["schema"]>(
    table: string,
    records: TypeOf<T>[]
): Query => {
    if (records.length === 0) throw new Error("records must be more than one");
    const columns = Object.keys(records[0]);
    return {
        sql: `INSERT INTO ${table} (${columns.join(",")}) VALUES ${records
            .map(
                () =>
                    `(${[...Array(columns.length).keys()]
                        .map((_, index) => `$${index + 1}`)
                        .join(",")})`
            )
            .join(", ")};`,
        values: records
            .map((record) => Object.values(ObjectUtil.nullishToNull(record)))
            .flat(),
    };
};

export const values = <T extends BaseTableSchema["schema"]>(
    table: string,
    records: TypeOf<T> | TypeOf<T>[]
): Query => {
    if (Array.isArray(records)) {
        return createBulkInsertQuery(table, records);
    } else {
        return createInsertQuery(table, records);
    }
};
