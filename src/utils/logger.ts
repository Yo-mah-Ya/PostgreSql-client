import { isObject } from "./object";

export type CallSite = {
    file?: string;
    function?: string;
    line?: string;
};
type LogMessage = {
    message: string;
    callSite?: CallSite;
};

export const parseObjectToString = <V>(message: Record<string, V>): string => {
    const body = Object.entries(message)
        .map(([key, value]) => `${key}: ${stringEscape(value)}`)
        .join(", ");
    return `{ ${body} }`;
};

// eslint-disable-next-line @typescript-eslint/ban-types
const functionEscape = (func: Function): string =>
    func.constructor.name === "Function"
        ? func.name === ""
            ? "arrow function"
            : `${func.name} function`
        : func.constructor.name === "AsyncFunction"
        ? func.name === ""
            ? "async arrow function"
            : `async ${func.name} function`
        : "unknown function";

const stringEscape = (message: unknown): string =>
    typeof message === "string"
        ? `"${message}"`
        : isObject(message)
        ? parseObjectToString(message)
        : Array.isArray(message)
        ? `[${message.map(stringEscape).join(", ")}]`
        : // avoid to call class object like "Date(), Error()" to escape "Uncaught TypeError: Class constructor xxx cannot be invoked without 'new'"
        typeof message === "function"
        ? functionEscape(message)
        : String(message);

export const logLevelConfig = {
    trace: {
        name: "TRACE",
        level: 0,
        logger: console.trace,
    },
    debug: {
        name: "DEBUG",
        level: 1,
        logger: console.debug,
    },
    info: {
        name: "INFO",
        level: 2,
        logger: console.info,
    },
    warn: {
        name: "WARN",
        level: 3,
        logger: console.warn,
    },
    error: {
        name: "ERROR",
        level: 4,
        logger: console.error,
    },
} as const;
export type LogLevelConfig = typeof logLevelConfig;

export const envLogLevelConfig = (() => {
    const logLevel = process.env.LOG_LEVEL;
    switch (logLevel) {
        case logLevelConfig.trace.name:
            return logLevelConfig.trace;
        case logLevelConfig.info.name:
            return logLevelConfig.info;
        case logLevelConfig.warn.name:
            return logLevelConfig.warn;
        case logLevelConfig.error.name:
            return logLevelConfig.error;
        case logLevelConfig.debug.name:
        default:
            return logLevelConfig.debug;
    }
})();

type ConsoleLogger =
    | Console["trace"]
    | Console["debug"]
    | Console["info"]
    | Console["warn"]
    | Console["error"];
export const getLogger = (
    logLevel: typeof logLevelConfig[keyof typeof logLevelConfig]
): ConsoleLogger => {
    if (logLevel.level >= envLogLevelConfig.level) {
        return logLevel.logger;
    } else {
        return () => {};
    }
};
export type GetLogger = typeof getLogger;

const messageWith = (
    logLevel: typeof logLevelConfig[keyof typeof logLevelConfig]
): (<T extends LogMessage>(message: T) => void) => {
    const logFn = getLogger(logLevel);
    const name = logFn.name.toUpperCase();
    return <T extends LogMessage>(message: T): void => {
        logFn(
            `[${name}] ${new Date().toISOString()} ${parseObjectToString(
                message
            )}`
        );
    };
};

export const trace = messageWith(logLevelConfig.trace);
export const debug = messageWith(logLevelConfig.debug);
export const info = messageWith(logLevelConfig.info);
export const warn = messageWith(logLevelConfig.warn);
export const error = messageWith(logLevelConfig.error);
