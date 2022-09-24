import type { PoolConfig } from "pg";
import type { BaseTableSchemas } from "./entity";
import { poolClient } from "./pool";
import { queryClient } from "./query";

export const postgreSql = <T extends BaseTableSchemas>(
    config: PoolConfig,
    tableSchemas: T
) =>
    ({
        poolClient: poolClient(config),
        queryClient: queryClient(tableSchemas),
    } as const);
