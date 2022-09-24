import type { TypeOf } from "io-ts";
import { ObjectUtil } from "../../utils";
import type { Query } from "../sql";
import type { BaseTableSchema } from "../../entity";

export const createUpdateQuery = <T extends BaseTableSchema["schema"]>(
    table: string,
    record: TypeOf<T>,
    whereConditions?: TypeOf<T>
): Query => {
    const columns = Object.keys(record);

    return {
        sql: `UPDATE ${table} SET ${columns
            .map((c, i) => `${c} = $${i + 1}`)
            .join(", ")} ${
            whereConditions
                ? `WHERE ${Object.keys(whereConditions)
                      .map((c, i) => `${c} = $${i + 1 + columns.length}`)
                      .join(" AND ")}`
                : ""
        };`,
        values: [
            ...Object.values(ObjectUtil.nullishToNull(record)),
            ...(whereConditions
                ? (Object.values(
                      ObjectUtil.nullishToNull(whereConditions)
                  ) as unknown[])
                : []),
        ],
    };
};
