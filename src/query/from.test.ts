import { from } from "./from";

describe(from, () => {
    test("", () => {
        from<{
            users: {
                id: number;
                name: string;
                birth_date: string;
            };
            courses: {
                id: number;
                name: string;
            };
        }>((f) => f.from("courses").innerJoin("users"));
    });
});
