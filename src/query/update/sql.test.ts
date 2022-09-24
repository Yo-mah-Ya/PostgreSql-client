import { createUpdateQuery } from "./sql";

describe(createUpdateQuery, () => {
    test("test", () => {
        console.log(
            createUpdateQuery('"actor"', {
                first_name: "Penelope",
                last_name: "Guiness",
                last_update: "2020-01-01T15:30:50.620Z",
            })
        );
    });
});
