import { fulfilledOnly } from "./promise";

describe("promise", () => {
    test("fulfilledOnly", async () => {
        expect(
            await fulfilledOnly([
                Promise.resolve(1),
                Promise.reject(new Error("failed")),
                Promise.resolve(3),
                Promise.resolve(undefined),
                Promise.resolve(5),
                Promise.reject(undefined),
            ])
        ).toStrictEqual(expect.arrayContaining([1, 3, undefined, 5]));
    });
});
