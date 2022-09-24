export type TableSchema = Record<string, string | number | boolean>;
export type TableSchemas = Record<string, TableSchema>;
export type Column<K> = K & string;
export type Table<T> = T & string;
