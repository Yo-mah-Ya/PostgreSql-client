import { poolClient } from "./pool";
import { queryClient } from "./query";

export const postgreSql = {
    poolClient,
    queryClient,
} as const;
