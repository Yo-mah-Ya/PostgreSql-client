import * as t from "io-ts";
import { TableSchema } from "../base/type";

const actor_notNull = t.type({
    id: t.Integer,
    last_update: t.string,
    first_name: t.string,
    last_name: t.string,
});
const actor_nullable = t.partial({});
const actor_schema = t.intersection([actor_notNull, actor_nullable]);
const actor_needWhenInsert = t.type({
    first_name: t.string,
    last_name: t.string,
});
type ActorSchema = t.TypeOf<typeof actor_schema>;
export const isActorSchema = (u: unknown): u is ActorSchema =>
    actor_schema.is(u);
export const decodeWithActorSchema = (u: unknown): t.Validation<ActorSchema> =>
    actor_schema.decode(u);

export const actor: TableSchema<
    typeof actor_schema,
    typeof actor_needWhenInsert
> = {
    schema: actor_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: actor_needWhenInsert,
    columnDefault: {
        id: "nextval('actor_id_seq'::regclass)",
        last_update: "now()",
    },
};
