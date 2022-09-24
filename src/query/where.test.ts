import { whereClause } from "./where";

describe(whereClause, () => {
    enum Sex {
        Men,
        Women,
        Other,
    }
    type TestTable = {
        id: number;
        name: string;
        birth_day: string;
        nationality: string;
        sex?: Sex;
    };
    test("whereClause", () => {
        const w = whereClause<TestTable>();
        expect(w.In("nationality", ["USA"]).toWhereSql()).toBe(
            'WHERE "nationality" IN ("USA")'
        );
        expect(
            w
                .eq("id", 196)
                .andEq("name", "Secret")
                .andIn("nationality", ["USA"])
                .orEq("birth_day", "1950-12-31")
                .orEq("sex", Sex.Men)
                .toWhereSql()
        ).toBe(
            'WHERE "id" = 196 AND "name" = "Secret" AND "nationality" IN ("USA") OR "birth_day" = "1950-12-31" OR "sex" = 0'
        );
        expect(
            w
                .In("nationality", ["USA"])
                .andEq("id", 196)
                .andEq("name", "Secret")
                .andBracket((w) =>
                    w.eq("name", "Secret").andEq("birth_day", "1950-12-31")
                )
                .orEq("sex", Sex.Other)
                .toWhereSql()
        ).toBe(
            `WHERE "nationality" IN ("USA") AND "id" = 196 AND "name" = "Secret" AND ("name" = "Secret" AND "birth_day" = "1950-12-31") OR "sex" = 2`
        );
    });
});
