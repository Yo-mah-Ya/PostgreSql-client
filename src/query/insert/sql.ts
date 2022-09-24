import { ObjectUtil } from "../../utils";
import type { Query } from "../sql";
import { TableSchema } from "../../entity";

export const createInsertQuery = (
    table: string,
    record: TableSchema
): Query => {
    const columns = Object.keys(record);
    return {
        sql: `INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns
            .map((_, index) => `$${index + 1}`)
            .join(",")});`,
        values: Object.values(ObjectUtil.nullishToNull(record)),
    };
};

export const createBulkInsertQuery = (
    table: string,
    records: TableSchema[]
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
