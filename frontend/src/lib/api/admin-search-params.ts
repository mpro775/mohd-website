import {
  parseAsString,
  parseAsInteger,
} from "nuqs";

// Standard query search params for the Admin resources DataTable
export const adminSearchParamsSchema = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  sortBy: parseAsString.withDefault("createdAt"),
  sortOrder: parseAsString.withDefault("desc"),
  status: parseAsString.withDefault("all"),
};
