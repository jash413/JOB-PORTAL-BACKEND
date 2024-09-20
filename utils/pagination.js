// utils/pagination.js

/**
 * Calculate pagination parameters based on request body.
 * @param {Object} body - Request body containing pagination parameters.
 * @param {number} [body.page=1] - Current page number.
 * @param {number} [body.limit] - Number of items per page.
 * @returns {Object} Pagination parameters.
 */
const getPagination = ({ page = 1, limit }) => {
  const parsedPage = Math.max(1, parseInt(page, 10));
  const parsedLimit =
    limit !== undefined ? Math.max(1, parseInt(limit, 10)) : null;

  return parsedLimit
    ? {
        limit: parsedLimit,
        offset: (parsedPage - 1) * parsedLimit,
        currentPage: parsedPage,
        isPaginated: true,
      }
    : {
        limit: null,
        offset: null,
        currentPage: 1,
        isPaginated: false,
      };
};

/**
 * Format the response data with pagination metadata.
 * @param {Object} data - Sequelize response from findAndCountAll().
 * @param {number} data.count - Total number of items.
 * @param {Array} data.rows - Retrieved records.
 * @param {number|null} limit - Number of items per page.
 * @param {number} currentPage - Current page number.
 * @returns {Object} Formatted response with data and pagination metadata.
 */
const getPagingData = (
  { count: totalItems, rows: records },
  limit,
  currentPage
) => {
  if (limit === null) return { records };

  const totalPages = Math.ceil(totalItems / limit);
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
 * Middleware for paginating database results using POST request body.
 * @param {Function} modelFindMethod - Sequelize model method to retrieve data.
 * @param {Object} body - Request body with pagination parameters.
 * @param {Object} [options={}] - Additional Sequelize options.
 * @returns {Promise<Object>} Paginated results with metadata.
 * @throws {Error} If pagination fails.
 */
const paginate = async (modelFindMethod, body, options = {}) => {
  try {
    const { limit, offset, currentPage, isPaginated } = getPagination(body);
    const queryOptions = isPaginated ? { ...options, limit, offset } : options;
    const data = await modelFindMethod(queryOptions);
    return getPagingData(data, limit, currentPage);
  } catch (error) {
    throw new Error(`Pagination failed: ${error.message}`);
  }
};

module.exports = {
  getPagination,
  getPagingData,
  paginate,
};
