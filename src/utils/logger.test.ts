import {
    parseObjectToString,
    GetLogger,
    LogLevelConfig,
    CallSite,
} from "./logger";

describe("logger", () => {
    class T {}
    test("parseObjectToString", () => {
        expect(
            parseObjectToString({
                a: 1,
                b: undefined,
                c: null,
                d: [0, 1, 2, 3],
                e: [{ a: "a" }, { b: true }, { c: [undefined] }],
            })
        ).toStrictEqual(
            `{ a: 1, b: undefined, c: null, d: [0, 1, 2, 3], e: [{ a: "a" }, { b: true }, { c: [undefined] }] }`
        );
        expect(
            parseObjectToString({
                h: {
                    a: [T, new T()],
                    b: [Error, new Error()],
                    c: [
                        () => "arrow test",
                        function test() {
                            return "function test";
                        },
                        () =>
                            new Promise((resolve) =>
                                resolve("arrow promise test")
                            ),
                        function promiseTest() {
                            return new Promise((resolve) =>
                                resolve("function promise test")
                            );
                        },
                    ],
                },
            })
        ).toStrictEqual(
            `{ h: { a: [T function, [object Object]], b: [Error function, Error], c: [arrow function, test function, arrow function, promiseTest function] } }`
        );
    });
});

describe("getLogger", () => {
    beforeEach(() => {
        jest.resetModules();
    });
    const print = (
        getLogger: GetLogger,
        logLevelConfig: LogLevelConfig,
        envLogLevelConfig: LogLevelConfig[keyof LogLevelConfig],
        callSite: CallSite
    ): void => {
        console.log(
            `-------------------------------${
                callSite.function ?? ""
            } print start----------------------------------`
        );
        console.dir(envLogLevelConfig);
        getLogger(logLevelConfig.trace)({ message: "trace message", callSite });
        getLogger(logLevelConfig.debug)({ message: "debug message", callSite });
        getLogger(logLevelConfig.info)({ message: "info message", callSite });
        getLogger(logLevelConfig.warn)({ message: "warn message", callSite });
        getLogger(logLevelConfig.error)({ message: "error message", callSite });
        console.log(
            `-------------------------------${
                callSite.function ?? ""
            } print end----------------------------------`
        );
    };
    test("TRACE", async () => {
        process.env.LOG_LEVEL = "TRACE";
        const { getLogger, logLevelConfig, envLogLevelConfig } = await import(
            "./logger"
        );
        print(getLogger, logLevelConfig, envLogLevelConfig, {
            function: "TRACE",
        });
    });

    test("DEBUG", async () => {
        process.env.LOG_LEVEL = "DEBUG";
        const { getLogger, logLevelConfig, envLogLevelConfig } = await import(
            "./logger"
        );
        print(getLogger, logLevelConfig, envLogLevelConfig, {
            function: "DEBUG",
        });
    });

    test("INFO", async () => {
        process.env.LOG_LEVEL = "INFO";
        const { getLogger, logLevelConfig, envLogLevelConfig } = await import(
            "./logger"
        );
        print(getLogger, logLevelConfig, envLogLevelConfig, {
            function: "INFO",
        });
    });

    test("WARN", async () => {
        process.env.LOG_LEVEL = "WARN";
        const { getLogger, logLevelConfig, envLogLevelConfig } = await import(
            "./logger"
        );
        print(getLogger, logLevelConfig, envLogLevelConfig, {
            function: "WARN",
        });
    });

    test("ERROR", async () => {
        process.env.LOG_LEVEL = "ERROR";
        const { getLogger, logLevelConfig, envLogLevelConfig } = await import(
            "./logger"
        );
        print(getLogger, logLevelConfig, envLogLevelConfig, {
            function: "ERROR",
        });
    });

    test("undefined", async () => {
        process.env.LOG_LEVEL = undefined;
        const { getLogger, logLevelConfig, envLogLevelConfig } = await import(
            "./logger"
        );
        print(getLogger, logLevelConfig, envLogLevelConfig, {
            function: "undefined",
        });
    });
    test("the others", async () => {
        process.env.LOG_LEVEL = "other";
        const { getLogger, logLevelConfig, envLogLevelConfig } = await import(
            "./logger"
        );
        print(getLogger, logLevelConfig, envLogLevelConfig, {
            function: "other",
        });
    });
});
