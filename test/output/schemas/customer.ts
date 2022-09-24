import * as t from "io-ts";
import { TableSchema } from "../base/type";

const customer_notNull = t.type({
    id: t.Integer,
    store_id: t.number,
    first_name: t.string,
    activebool: t.boolean,
    last_name: t.string,
    address_id: t.number,
    create_date: t.string,
});
const customer_nullable = t.partial({
    email: t.string,
    last_update: t.string,
    active: t.Integer,
});
const customer_schema = t.intersection([customer_notNull, customer_nullable]);
const customer_needWhenInsert = t.type({
    store_id: t.number,
    first_name: t.string,
    last_name: t.string,
    address_id: t.number,
});
type CustomerSchema = t.TypeOf<typeof customer_schema>;
export const isCustomerSchema = (u: unknown): u is CustomerSchema =>
    customer_schema.is(u);
export const decodeWithCustomerSchema = (
    u: unknown
): t.Validation<CustomerSchema> => customer_schema.decode(u);

export const customer: TableSchema<
    typeof customer_schema,
    typeof customer_needWhenInsert
> = {
    schema: customer_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: customer_needWhenInsert,
    columnDefault: {
        id: "nextval('customer_id_seq'::regclass)",
        last_update: "now()",
        activebool: "true",
        create_date: "('now'::text)::date",
    },
};
