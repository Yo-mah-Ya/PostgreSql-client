import type { PoolClient } from "pg";
import { Validation } from "io-ts";
import { execute } from "..";
import { Query } from "../sql";
import { ObjectUtil } from "../../utils";
import { assertCodecWith } from "../../entity";

const selectAll = async <T extends Record<string, unknown>>(
    poolClient: PoolClient,
    query: Query,
    decodeWith?: (u: unknown) => Validation<T>
): Promise<T[]> =>
    (
        await execute(poolClient, query, {
            file: __filename,
            function: selectAll.name,
        })
    ).rows.map((row) => {
        const res = ObjectUtil.omitNullish(row as Record<string, unknown>);
        return decodeWith ? assertCodecWith(decodeWith(res)) : (res as T);
    });

const selectOne = async <T extends Record<string, unknown>>(
    poolClient: PoolClient,
    query: Query,
    decodeWith?: (u: unknown) => Validation<T>
): Promise<T | undefined> => {
    const { rows } = await execute(poolClient, query, {
        file: __filename,
        function: selectOne.name,
    });
    if (rows.length === 1) {
        const res = ObjectUtil.omitNullish(rows[0] as Record<string, unknown>);
        return decodeWith ? assertCodecWith(decodeWith(res)) : (res as T);
    } else {
        return undefined;
    }
};

export type SelectClient = {
    selectAll: <T extends Record<string, unknown>>(
        poolClient: PoolClient,
        query: Query,
        decodeWith?: (u: unknown) => Validation<T>
    ) => Promise<T[]>;
    selectOne: <T extends Record<string, unknown>>(
        poolClient: PoolClient,
        query: Query,
        decodeWith?: (u: unknown) => Validation<T>
    ) => Promise<T | undefined>;
};
export const selectClient = (): SelectClient =>
    ({
        selectAll,
        selectOne,
    } as const);
