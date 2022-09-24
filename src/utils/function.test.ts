import { compose } from "./function";

describe(compose, () => {
    test("compose", () => {
        expect(
            compose(
                (message: string) => `${message} World`,
                (message: string) => `${message} Hello`
            )("Hi")
        ).toStrictEqual("Hi Hello World");
    });
});
