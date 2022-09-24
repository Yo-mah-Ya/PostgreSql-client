import * as t from "io-ts";
import { TableSchema } from "../base/type";

const language_notNull = t.type({
    id: t.Integer,
    name: t.string,
    last_update: t.string,
});
const language_nullable = t.partial({});
const language_schema = t.intersection([language_notNull, language_nullable]);
const language_needWhenInsert = t.type({ name: t.string });
type LanguageSchema = t.TypeOf<typeof language_schema>;
export const isLanguageSchema = (u: unknown): u is LanguageSchema =>
    language_schema.is(u);
export const decodeWithLanguageSchema = (
    u: unknown
): t.Validation<LanguageSchema> => language_schema.decode(u);

export const language: TableSchema<
    typeof language_schema,
    typeof language_needWhenInsert
> = {
    schema: language_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: language_needWhenInsert,
    columnDefault: {
        id: "nextval('language_id_seq'::regclass)",
        last_update: "now()",
    },
};
