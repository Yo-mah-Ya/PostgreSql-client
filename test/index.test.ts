import { postgreSql } from "../src";
import { assertGetEnvValueFrom, toNumber } from "../src/utils";

describe("postgreSql", () => {
    test("", () => {
        type Tables = {
            users: {
                id: number;
                name: string;
                birth_date: string;
            };
            courses: {
                id: number;
                name: string;
            };
        };
        const client = postgreSql.poolClient({
            host: assertGetEnvValueFrom("POSTGRESQL_HOST"),
            port: toNumber(assertGetEnvValueFrom("POSTGRES_PORT")),
            database: assertGetEnvValueFrom("POSTGRES_DB"),
            user: assertGetEnvValueFrom("POSTGRESQL_USER"),
            password: assertGetEnvValueFrom("POSTGRESQL_PASSWORD"),
        });
        const { select, insert } = postgreSql.queryClient<Tables>();

        (async () => {
            await client.autoTransaction(async (pool) => {
                await select.selectAll<Tables["users"]>(pool, {
                    sql: "SELECT * FROM users WHERE id = $1;",
                    values: [1],
                });
                await insert.into("users").insert(pool, {
                    id: 0,
                    name: "",
                    birth_date: new Date().toISOString(),
                });
                await insert.into("users").bulkInsert(pool, [
                    {
                        id: 0,
                        name: "",
                        birth_date: new Date().toISOString(),
                    },
                ]);
            });
        })().catch(() => {});
    });
});
