import { Pool, PoolConfig } from "pg";
import { RunQueries, manualTransaction, autoTransaction } from "./transaction";

export type PoolClient = {
    pool: Pool;
    manualTransaction: <T>(runQueries: RunQueries<T>) => Promise<T>;
    autoTransaction: <T>(runQueries: RunQueries<T>) => Promise<T>;
};

export const poolClient = (config: PoolConfig): PoolClient => {
    const pool = new Pool({
        max: 10,
        ...config,
    });
    return {
        pool,
        manualTransaction: async <T>(runQueries: RunQueries<T>) =>
            manualTransaction(pool, runQueries),
        autoTransaction: async <T>(runQueries: RunQueries<T>) =>
            autoTransaction(pool, runQueries),
    };
};
