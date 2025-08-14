/**
 * Pagination utilities for Strapi API controllers
 */

import { Pagination } from "@strapi/utils/dist/pagination";

/**
 * Calculate pagination limits from query parameters
 * @param queryPagination - Pagination parameters from query
 * @returns Object containing start and limit for pagination
 */
export const calculatePagination = (
  queryPagination: Pagination
): {
  start: number;
  limit: number;
} => {
  const DEFAULT_START = 0;
  const DEFAULT_LIMIT = 25;
  if (!queryPagination) {
    return {
      start: DEFAULT_START,
      limit: DEFAULT_LIMIT,
    };
  }
  if ("start" in queryPagination && "limit" in queryPagination) {
    return {
      start: Number(queryPagination["start"]) || DEFAULT_START,
      limit: Number(queryPagination["limit"]) || DEFAULT_LIMIT,
    };
  } else if ("page" in queryPagination && "pageSize" in queryPagination) {
    const page =
      Number(queryPagination["page"]) <= 0
        ? DEFAULT_START
        : Number(queryPagination["page"]);
    const pageSize = Number(queryPagination["pageSize"]) || DEFAULT_LIMIT;
    return {
      start: (page - 1) * pageSize,
      limit: pageSize,
    };
  } else {
    return {
      start: DEFAULT_START,
      limit: DEFAULT_LIMIT,
    };
  }
};
