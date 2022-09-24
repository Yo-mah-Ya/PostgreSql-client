import { main } from "../scripts";

main({
    poolConfig: {
        host: "localhost",
        port: 5432,
        database: "dvdrental",
        user: "postgres",
        password: "password",
    },
    postgresSchema: "public",
    outputDir: `${__dirname}/output`,
}).catch((error) => {
    console.error(error);
});
