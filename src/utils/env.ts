export const assertGetEnvValueFrom = (key: string): string => {
    const value = process.env[key];
    if (value == undefined)
        throw new Error(
            `Cannot get Environment Value. value is undefined, key: ${key}`
        );
    return value;
};
