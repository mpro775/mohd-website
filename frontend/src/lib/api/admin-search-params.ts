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
  category: parseAsString.withDefault(""),
  isActive: parseAsString.withDefault("all"),
  isPublished: parseAsString.withDefault("all"),
  action: parseAsString.withDefault(""),
  resource: parseAsString.withDefault(""),
  actorId: parseAsString.withDefault(""),
  actorEmail: parseAsString.withDefault(""),
  resourceId: parseAsString.withDefault(""),
  dateFrom: parseAsString.withDefault(""),
  dateTo: parseAsString.withDefault(""),
  type: parseAsString.withDefault("all"),
  folder: parseAsString.withDefault("all"),
  isUsed: parseAsString.withDefault("all"),
  platform: parseAsString.withDefault(""),
  issuer: parseAsString.withDefault(""),
  year: parseAsString.withDefault(""),
  isFeatured: parseAsString.withDefault("all"),
  degreeType: parseAsString.withDefault("all"),
  isCurrent: parseAsString.withDefault("all"),
  institution: parseAsString.withDefault(""),
  startYear: parseAsString.withDefault(""),
  endYear: parseAsString.withDefault(""),
};

