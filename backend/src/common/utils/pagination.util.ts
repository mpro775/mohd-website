import { IPaginatedResponse } from '../dto/pagination.dto';

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): IPaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
