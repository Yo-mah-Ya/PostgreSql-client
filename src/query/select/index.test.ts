import { selectClient } from ".";

describe(selectClient, () => {
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
    const select = selectClient<Tables>();
    test("", () => {
        console.log(
            select
                .from("users")
                .where((w) =>
                    w
                        .eq("id", 1)
                        .orBracket((w) =>
                            w
                                .eq("birth_date", "1950-01-01")
                                .andEq("name", "test")
                        )
                )
                .groupBy(["id", "birth_date"])
                .select(["id"])
                .getSql()
        );
    });
});
