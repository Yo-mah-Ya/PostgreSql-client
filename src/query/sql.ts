export type Query = {
    sql: string;
    values: unknown[];
};

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
export const escapeIdentifier = (str: string): string =>
    '"' + str.replace(/"/g, '""') + '"';
