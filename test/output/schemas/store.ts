import * as t from "io-ts";
import { TableSchema } from "../base/type";

const store_notNull = t.type({
    id: t.Integer,
    last_update: t.string,
    manager_staff_id: t.number,
    address_id: t.number,
});
const store_nullable = t.partial({});
const store_schema = t.intersection([store_notNull, store_nullable]);
const store_needWhenInsert = t.type({
    manager_staff_id: t.number,
    address_id: t.number,
});
type StoreSchema = t.TypeOf<typeof store_schema>;
export const isStoreSchema = (u: unknown): u is StoreSchema =>
    store_schema.is(u);
export const decodeWithStoreSchema = (u: unknown): t.Validation<StoreSchema> =>
    store_schema.decode(u);

export const store: TableSchema<
    typeof store_schema,
    typeof store_needWhenInsert
> = {
    schema: store_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: store_needWhenInsert,
    columnDefault: {
        id: "nextval('store_id_seq'::regclass)",
        last_update: "now()",
    },
};
