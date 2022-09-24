import type { TypeOf } from "io-ts";
import { ObjectUtil } from "../../utils";
import type { Query } from "../sql";
import type { BaseTableSchema } from "../../entity";

export const createDeleteQuery = <T extends BaseTableSchema["schema"]>(
    table: string,
    where?: TypeOf<T>
): Query => {
    const columns = where ? Object.keys(where) : [];

    return {
        sql: `DELETE ${table} ${
            columns.length
                ? `WHERE ${columns
                      .map((c, i) => `${c} = $${i + 1}`)
                      .join(" AND ")}`
                : ""
        };`,
        values: where ? Object.values(ObjectUtil.nullishToNull(where)) : [],
    };
};
