import * as t from "io-ts";
import { TableSchema } from "../base/type";

const inventory_notNull = t.type({
    id: t.Integer,
    store_id: t.number,
    last_update: t.string,
    film_id: t.number,
});
const inventory_nullable = t.partial({});
const inventory_schema = t.intersection([
    inventory_notNull,
    inventory_nullable,
]);
const inventory_needWhenInsert = t.type({
    store_id: t.number,
    film_id: t.number,
});
type InventorySchema = t.TypeOf<typeof inventory_schema>;
export const isInventorySchema = (u: unknown): u is InventorySchema =>
    inventory_schema.is(u);
export const decodeWithInventorySchema = (
    u: unknown
): t.Validation<InventorySchema> => inventory_schema.decode(u);

export const inventory: TableSchema<
    typeof inventory_schema,
    typeof inventory_needWhenInsert
> = {
    schema: inventory_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: inventory_needWhenInsert,
    columnDefault: {
        id: "nextval('inventory_id_seq'::regclass)",
        last_update: "now()",
    },
};
