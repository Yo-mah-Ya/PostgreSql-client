import * as t from "io-ts";
import { TableSchema } from "../base/type";

const film_actor_notNull = t.type({
    id: t.Integer,
    actor_id: t.number,
    film_id: t.number,
    last_update: t.string,
});
const film_actor_nullable = t.partial({});
const film_actor_schema = t.intersection([
    film_actor_notNull,
    film_actor_nullable,
]);
const film_actor_needWhenInsert = t.type({
    actor_id: t.number,
    film_id: t.number,
});
type Film_actorSchema = t.TypeOf<typeof film_actor_schema>;
export const isFilm_actorSchema = (u: unknown): u is Film_actorSchema =>
    film_actor_schema.is(u);
export const decodeWithFilm_actorSchema = (
    u: unknown
): t.Validation<Film_actorSchema> => film_actor_schema.decode(u);

export const film_actor: TableSchema<
    typeof film_actor_schema,
    typeof film_actor_needWhenInsert
> = {
    schema: film_actor_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: film_actor_needWhenInsert,
    columnDefault: {
        id: "nextval('film_actor_id_seq'::regclass)",
        last_update: "now()",
    },
};
