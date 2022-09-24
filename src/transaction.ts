import type { Pool, PoolClient } from "pg";
import { Logger, errorMessageOf } from "./utils";

export type RunQueries<T> = (client: PoolClient) => Promise<T>;

export const autoTransaction = async <T>(
    pool: Pool,
    runQueries: RunQueries<T>
): Promise<T> => {
    const client = await pool.connect();

    try {
        return await runQueries(client);
    } catch (error) {
        Logger.warn({
            message: errorMessageOf(error),
            callSite: {
                file: __filename,
                function: autoTransaction.name,
            },
        });
        throw error;
    } finally {
        client.release();
    }
};

export const manualTransaction = async <T>(
    pool: Pool,
    runQueries: RunQueries<T>
): Promise<T> => {
    const client = await pool.connect();
    await client.query("BEGIN");

    try {
        const response = await runQueries(client);
        await client.query("COMMIT");
        return response;
    } catch (error) {
        Logger.warn({
            message: errorMessageOf(error),
            callSite: {
                file: __filename,
                function: manualTransaction.name,
            },
        });
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
