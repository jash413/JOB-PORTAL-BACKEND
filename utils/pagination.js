// utils/pagination.js

/**
 * Calculate pagination parameters based on request query.
 * @param {Object} query - Request query object containing pagination parameters.
 * @returns {Object} - Pagination parameters (limit, offset, currentPage, isPaginated).
 */
const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = query.limit !== undefined ? parseInt(query.limit, 10) : null;

  // If limit is not passed or invalid (<= 0), no pagination is applied
  if (!limit || limit <= 0) {
    return {
      limit: null,
      offset: null,
      currentPage: 1,
      isPaginated: false,
    };
  }

  const offset = (page - 1) * limit;

  return {
    limit,
    offset,
    currentPage: page,
    isPaginated: true,
  };
};

/**
 * Format the response data to include pagination metadata if pagination is enabled.
 * @param {Object} data - Sequelize response from `findAndCountAll()` or similar methods.
 * @param {number|null} limit - Number of items per page. If null, all items are returned without pagination metadata.
 * @param {number} page - The current page number.
 * @returns {Object} - A formatted response object with data and pagination metadata.
 */
const getPagingData = (data, limit, page) => {
  const { count: totalItems, rows: records } = data;

  // If limit is null, return all records without pagination
  if (limit === null) {
    return { records };
  }

  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = page;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    records,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      nextPage: hasNextPage ? currentPage + 1 : null,
      prevPage: hasPreviousPage ? currentPage - 1 : null,
      hasNextPage,
      hasPreviousPage,
    },
  };
};

/**
 * Middleware for paginating database results.
 * @param {Function} modelFindMethod - Sequelize model method (e.g., `findAndCountAll`) to retrieve paginated data.
 * @param {Object} query - Request query object containing page and limit.
 * @param {Object} options - Additional Sequelize options (like where, order).
 * @returns {Object} - Paginated results with pagination metadata.
 */
const paginate = async (modelFindMethod, query, options = {}) => {
  try {
    const { limit, offset, currentPage, isPaginated } = getPagination(query);

    let data;
    if (isPaginated) {
      // Paginated query
      data = await modelFindMethod({
        ...options,
        limit,
        offset,
      });
    } else {
      // Fetch all records without limit
      data = await modelFindMethod({
        ...options,
      });
    }

    return getPagingData(data, limit, currentPage);
  } catch (error) {
    throw new Error(`Pagination error: ${error.message}`);
  }
};

module.exports = {
  getPagination,
  getPagingData,
  paginate,
};
