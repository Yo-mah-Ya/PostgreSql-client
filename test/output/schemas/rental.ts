import * as t from "io-ts";
import { TableSchema } from "../base/type";

const rental_notNull = t.type({
    id: t.Integer,
    staff_id: t.number,
    inventory_id: t.Integer,
    customer_id: t.number,
    last_update: t.string,
    rental_date: t.string,
});
const rental_nullable = t.partial({ return_date: t.string });
const rental_schema = t.intersection([rental_notNull, rental_nullable]);
const rental_needWhenInsert = t.type({
    staff_id: t.number,
    inventory_id: t.Integer,
    customer_id: t.number,
    rental_date: t.string,
});
type RentalSchema = t.TypeOf<typeof rental_schema>;
export const isRentalSchema = (u: unknown): u is RentalSchema =>
    rental_schema.is(u);
export const decodeWithRentalSchema = (
    u: unknown
): t.Validation<RentalSchema> => rental_schema.decode(u);

export const rental: TableSchema<
    typeof rental_schema,
    typeof rental_needWhenInsert
> = {
    schema: rental_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: rental_needWhenInsert,
    columnDefault: {
        id: "nextval('rental_id_seq'::regclass)",
        last_update: "now()",
    },
};
