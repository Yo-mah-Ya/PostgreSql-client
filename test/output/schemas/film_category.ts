import * as t from "io-ts";
import { TableSchema } from "../base/type";

const film_category_notNull = t.type({
    id: t.Integer,
    film_id: t.number,
    category_id: t.number,
    last_update: t.string,
});
const film_category_nullable = t.partial({});
const film_category_schema = t.intersection([
    film_category_notNull,
    film_category_nullable,
]);
const film_category_needWhenInsert = t.type({
    film_id: t.number,
    category_id: t.number,
});
type Film_categorySchema = t.TypeOf<typeof film_category_schema>;
export const isFilm_categorySchema = (u: unknown): u is Film_categorySchema =>
    film_category_schema.is(u);
export const decodeWithFilm_categorySchema = (
    u: unknown
): t.Validation<Film_categorySchema> => film_category_schema.decode(u);

export const film_category: TableSchema<
    typeof film_category_schema,
    typeof film_category_needWhenInsert
> = {
    schema: film_category_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: film_category_needWhenInsert,
    columnDefault: {
        id: "nextval('film_category_id_seq'::regclass)",
        last_update: "now()",
    },
};
