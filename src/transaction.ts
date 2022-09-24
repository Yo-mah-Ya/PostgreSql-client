import type { Pool, PoolClient } from "pg";
import { Logger, errorMessageOf } from "./utils";

export type RunQueries<T> = (poolClient: PoolClient) => Promise<T>;

export const autoTransaction = async <T>(
    pool: Pool,
    runQueries: RunQueries<T>
): Promise<T> => {
    const poolClient = await pool.connect();

    try {
        return await runQueries(poolClient);
    } catch (error) {
        Logger.warn({
            message: errorMessageOf(error),
            callSite: {
                file: __filename,
                function: autoTransaction.name,
            },
            error,
        });
        throw error;
    } finally {
        poolClient.release();
    }
};

export const manualTransaction = async <T>(
    pool: Pool,
    runQueries: RunQueries<T>
): Promise<T> => {
    const poolClient = await pool.connect();
    await poolClient.query("BEGIN");

    try {
        const response = await runQueries(poolClient);
        await poolClient.query("COMMIT");
        return response;
    } catch (error) {
        Logger.warn({
            message: errorMessageOf(error),
            callSite: {
                file: __filename,
                function: manualTransaction.name,
            },
            error,
        });
        await poolClient.query("ROLLBACK");
        throw error;
    } finally {
        poolClient.release();
    }
};
