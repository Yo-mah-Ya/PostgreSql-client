import * as t from "io-ts";
import { TableSchema } from "../base/type";

const category_notNull = t.type({
    id: t.Integer,
    name: t.string,
    last_update: t.string,
});
const category_nullable = t.partial({});
const category_schema = t.intersection([category_notNull, category_nullable]);
const category_needWhenInsert = t.type({ name: t.string });
type CategorySchema = t.TypeOf<typeof category_schema>;
export const isCategorySchema = (u: unknown): u is CategorySchema =>
    category_schema.is(u);
export const decodeWithCategorySchema = (
    u: unknown
): t.Validation<CategorySchema> => category_schema.decode(u);

export const category: TableSchema<
    typeof category_schema,
    typeof category_needWhenInsert
> = {
    schema: category_schema,
    primaryKeys: ["id"],
    uniqueKeys: [],
    needWhenInsert: category_needWhenInsert,
    columnDefault: {
        id: "nextval('category_id_seq'::regclass)",
        last_update: "now()",
    },
};
