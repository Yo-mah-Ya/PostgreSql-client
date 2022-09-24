import { language } from "./schemas/language";
import { actor } from "./schemas/actor";
import { film } from "./schemas/film";
import { category } from "./schemas/category";
import { film_actor } from "./schemas/film_actor";
import { inventory } from "./schemas/inventory";
import { film_category } from "./schemas/film_category";
import { country } from "./schemas/country";
import { city } from "./schemas/city";
import { address } from "./schemas/address";
import { staff } from "./schemas/staff";
import { customer } from "./schemas/customer";
import { store } from "./schemas/store";
import { rental } from "./schemas/rental";
import { payment } from "./schemas/payment";

export const tablesSchemas = {
    language,
    actor,
    film,
    category,
    film_actor,
    inventory,
    film_category,
    country,
    city,
    address,
    staff,
    customer,
    store,
    rental,
    payment,
} as const;
export type TableSchemas = typeof tablesSchemas;
