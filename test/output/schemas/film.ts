import * as t from "io-ts";
import { TableSchema } from "../base/type";

const film_notNull = t.type({
    id: t.Integer,
    replacement_cost: t.number,
    rental_duration: t.number,
    title: t.string,
    rental_rate: t.number,
    fulltext: t.string,
    language_id: t.number,
    last_update: t.string,
});
const film_nullable = t.partial({
    length: t.number,
    release_year: t.number,
    rating: t.unknown,
    description: t.string,
    special_features: t.array(t.unknown),
});
const film_schema = t.intersection([film_notNull, film_nullable]);
const film_needWhenInsert = t.type({
    title: t.string,
    fulltext: t.string,
    language_id: t.number,
});
type FilmSchema = t.TypeOf<typeof film_schema>;
export const isFilmSchema = (u: unknown): u is FilmSchema => film_schema.is(u);
export const decodeWithFilmSchema = (u: unknown): t.Validation<FilmSchema> =>
    film_schema.decode(u);

export const film: TableSchema<typeof film_schema, typeof film_needWhenInsert> =
    {
        schema: film_schema,
        primaryKeys: ["id"],
        uniqueKeys: [],
        needWhenInsert: film_needWhenInsert,
        columnDefault: {
            id: "nextval('film_id_seq'::regclass)",
            replacement_cost: "19.99",
            rental_duration: "3",
            rental_rate: "4.99",
            last_update: "now()",
            rating: "'G'::mpaa_rating",
        },
    };
