import * as t from "io-ts";
import { TableSchema } from "../base/type";

const country_notNull = t.type({
    id: t.Integer,
    last_update: t.string,
    name: t.string,
});
const country_nullable = t.partial({});
const country_schema = t.intersection([country_notNull, country_nullable]);
const country_needWhenInsert = t.type({ name: t.string });
type CountrySchema = t.TypeOf<typeof country_schema>;
export const isCountrySchema = (u: unknown): u is CountrySchema =>
    country_schema.is(u);
export const decodeWithCountrySchema = (
    u: unknown
): t.Validation<CountrySchema> => country_schema.decode(u);

export const country: TableSchema<
    typeof country_schema,
    typeof country_needWhenInsert
> = {
    schema: country_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: country_needWhenInsert,
    columnDefault: {
        id: "nextval('country_id_seq'::regclass)",
        last_update: "now()",
    },
};
