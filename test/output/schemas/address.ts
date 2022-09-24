import * as t from "io-ts";
import { TableSchema } from "../base/type";

const address_notNull = t.type({
    id: t.Integer,
    district: t.string,
    last_update: t.string,
    phone: t.string,
    address: t.string,
    city_id: t.number,
});
const address_nullable = t.partial({
    postal_code: t.string,
    address2: t.string,
});
const address_schema = t.intersection([address_notNull, address_nullable]);
const address_needWhenInsert = t.type({
    district: t.string,
    phone: t.string,
    address: t.string,
    city_id: t.number,
});
type AddressSchema = t.TypeOf<typeof address_schema>;
export const isAddressSchema = (u: unknown): u is AddressSchema =>
    address_schema.is(u);
export const decodeWithAddressSchema = (
    u: unknown
): t.Validation<AddressSchema> => address_schema.decode(u);

export const address: TableSchema<
    typeof address_schema,
    typeof address_needWhenInsert
> = {
    schema: address_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: address_needWhenInsert,
    columnDefault: {
        id: "nextval('address_id_seq'::regclass)",
        last_update: "now()",
    },
};
