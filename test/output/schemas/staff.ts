import * as t from "io-ts";
import { TableSchema } from "../base/type";

const staff_notNull = t.type({
    id: t.Integer,
    active: t.boolean,
    address_id: t.number,
    last_name: t.string,
    first_name: t.string,
    username: t.string,
    store_id: t.number,
    last_update: t.string,
});
const staff_nullable = t.partial({
    picture: t.unknown,
    password: t.string,
    email: t.string,
});
const staff_schema = t.intersection([staff_notNull, staff_nullable]);
const staff_needWhenInsert = t.type({
    address_id: t.number,
    last_name: t.string,
    first_name: t.string,
    username: t.string,
    store_id: t.number,
});
type StaffSchema = t.TypeOf<typeof staff_schema>;
export const isStaffSchema = (u: unknown): u is StaffSchema =>
    staff_schema.is(u);
export const decodeWithStaffSchema = (u: unknown): t.Validation<StaffSchema> =>
    staff_schema.decode(u);

export const staff: TableSchema<
    typeof staff_schema,
    typeof staff_needWhenInsert
> = {
    schema: staff_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: staff_needWhenInsert,
    columnDefault: {
        id: "nextval('staff_id_seq'::regclass)",
        active: "true",
        last_update: "now()",
    },
};
