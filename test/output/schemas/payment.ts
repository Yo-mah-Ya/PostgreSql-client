import * as t from "io-ts";
import { TableSchema } from "../base/type";

const payment_notNull = t.type({
    id: t.Integer,
    payment_date: t.string,
    staff_id: t.number,
    rental_id: t.Integer,
    customer_id: t.number,
    amount: t.number,
});
const payment_nullable = t.partial({});
const payment_schema = t.intersection([payment_notNull, payment_nullable]);
const payment_needWhenInsert = t.type({
    payment_date: t.string,
    staff_id: t.number,
    rental_id: t.Integer,
    customer_id: t.number,
    amount: t.number,
});
type PaymentSchema = t.TypeOf<typeof payment_schema>;
export const isPaymentSchema = (u: unknown): u is PaymentSchema =>
    payment_schema.is(u);
export const decodeWithPaymentSchema = (
    u: unknown
): t.Validation<PaymentSchema> => payment_schema.decode(u);

export const payment: TableSchema<
    typeof payment_schema,
    typeof payment_needWhenInsert
> = {
    schema: payment_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: payment_needWhenInsert,
    columnDefault: { id: "nextval('payment_id_seq'::regclass)" },
};
