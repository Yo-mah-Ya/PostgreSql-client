import * as t from "io-ts";
import { TableSchema } from "../base/type";

const city_notNull = t.type({
    id: t.Integer,
    last_update: t.string,
    country_id: t.number,
    name: t.string,
});
const city_nullable = t.partial({});
const city_schema = t.intersection([city_notNull, city_nullable]);
const city_needWhenInsert = t.type({ country_id: t.number, name: t.string });
type CitySchema = t.TypeOf<typeof city_schema>;
export const isCitySchema = (u: unknown): u is CitySchema => city_schema.is(u);
export const decodeWithCitySchema = (u: unknown): t.Validation<CitySchema> =>
    city_schema.decode(u);

export const city: TableSchema<typeof city_schema, typeof city_needWhenInsert> =
    {
        schema: city_schema,
        primaryKeys: ["id"],
        uniqueKeys: [],
        needWhenInsert: city_needWhenInsert,
        columnDefault: {
            id: "nextval('city_id_seq'::regclass)",
            last_update: "now()",
        },
    };
