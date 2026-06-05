import {
  FILTER_FROM,
  FILTER_INSENSITIVE,
  FILTER_MAX,
  FILTER_MIN,
  FILTER_TO,
  SORT_DESC,
} from "../constants/labels.js";

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface SortInput {
  field: string;
  order: "asc" | "desc";
}

export interface RangeFilter {
  min?: number;
  max?: number;
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface FilterInput {
  pagination?: PaginationInput;
  sort?: SortInput;
  filters?: Record<string, any>;
}

export interface BuiltQuery {
  where: Record<string, any>;
  skip: number;
  take: number;
  orderBy: Record<string, any>;
}

// ---------------------------------------------------
// Field Type Handlers
// ---------------------------------------------------
const buildFieldFilter = (key: string, value: any): Record<string, any> => {
  // Range filter → { min, max }
  if (
    value &&
    typeof value === "object" &&
    (FILTER_MIN in value || FILTER_MAX in value)
  ) {
    const range: Record<string, any> = {};
    if (value.min !== undefined) range.gte = value.min;
    if (value.max !== undefined) range.lte = value.max;
    return { [key]: range };
  }

  // Date range filter → { from, to }
  if (
    value &&
    typeof value === "object" &&
    (FILTER_FROM in value || FILTER_TO in value)
  ) {
    const range: Record<string, any> = {};
    if (value.from) range.gte = new Date(value.from);
    if (value.to) range.lte = new Date(value.to);
    return { [key]: range };
  }

  // Array filter → multiple values
  if (Array.isArray(value)) {
    return { [key]: { in: value } };
  }

  // Boolean filter
  if (typeof value === "boolean") {
    return { [key]: value };
  }

  // String filter → exact match
  return { [key]: value };
};

// ---------------------------------------------------
// Search Builder (searches across multiple fields)
// ---------------------------------------------------
const buildSearchFilter = (
  search: string,
  searchFields: string[]
): Record<string, any> => {
  return {
    OR: searchFields.map((field) => ({
      [field]: { contains: search, mode: FILTER_INSENSITIVE },
    })),
  };
};

// ---------------------------------------------------
// Main Filter Builder
// ---------------------------------------------------
export const buildFilterQuery = (
  input: FilterInput,
  searchFields: string[] = []
): BuiltQuery => {
  const page = Math.max(1, Number(input.pagination?.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(input.pagination?.limit) || 10)
  );
  const skip = (page - 1) * limit;

  // Build orderBy
  const orderBy = input.sort
    ? { [input.sort.field]: input.sort.order }
    : { createdAt: SORT_DESC };

  // Build where clause
  const where: Record<string, any> = {};
  const andConditions: Record<string, any>[] = [];

  if (input.filters) {
    const { search, ...restFilters } = input.filters;

    // Handle search separately
    if (search && searchFields.length > 0) {
      andConditions.push(buildSearchFilter(search, searchFields));
    }

    // Handle other filters
    for (const [key, value] of Object.entries(restFilters)) {
      if (value === undefined || value === null || value === "") continue;
      andConditions.push(buildFieldFilter(key, value));
    }
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return { where, skip, take: limit, orderBy };
};

// ---------------------------------------------------
// Pagination Meta Builder
// ---------------------------------------------------
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});
