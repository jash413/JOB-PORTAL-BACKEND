// utils/aggregator.js
const { Op } = require("sequelize");
const { paginate } = require("./pagination");

/**
 * Creates dynamic allowed filters including date ranges.
 * @param {string[]} fields - Standard fields for filtering.
 * @param {string[]} rangeFields - Fields supporting range filtering.
 * @returns {Object} Allowed filters object.
 */
const createAllowedFilters = (fields = [], rangeFields = []) => {
  const standardFilters = fields.reduce(
    (acc, field) => ({
      ...acc,
      [field]: { field, operator: Op.eq },
    }),
    {}
  );

  const rangeFilters = rangeFields.reduce(
    (acc, field) => ({
      ...acc,
      [field]: { field, operator: Op.between },
    }),
    {}
  );

  return { ...standardFilters, ...rangeFilters };
};

/**
 * Builds Sequelize `where` clause from query parameters and allowed filters.
 * @param {Object} body - Request body with filter parameters.
 * @param {Object} allowedFilters - Mapping of query keys to Sequelize fields and operators.
 * @param {string[]} searchFields - Fields for search operation.
 * @returns {Object} Sequelize `where` clause.
 */
const buildWhereClause = (body, allowedFilters, searchFields = []) => {
  const where = Object.entries(allowedFilters).reduce(
    (acc, [filterKey, { field, operator }]) => {
      if (body[filterKey] === undefined) return acc;

      if (operator === Op.between) {
        const from = body[`${filterKey}_from`];
        const to = body[`${filterKey}_to`];
        if (from !== undefined && to !== undefined) {
          acc[field] = { [operator]: [from, to] };
        }
      } else {
        acc[field] = { [operator]: body[filterKey] };
      }
      return acc;
    },
    {}
  );

  if (body.search) {
    where[Op.or] = searchFields.map((field) => ({
      [field]: { [Op.like]: `%${body.search}%` },
    }));
  }

  return where;
};

/**
 * Builds Sequelize order clause for sorting.
 * @param {Object} sortBy, sortOrder - Sort parameters.
 * @param {string[]} allowedSortFields - Allowed fields for sorting.
 * @returns {Array} Sequelize `order` clause.
 */
const buildOrderClause = ({ sortBy, sortOrder = "ASC" }, allowedSortFields) =>
  sortBy && allowedSortFields.includes(sortBy)
    ? [[sortBy, sortOrder.toUpperCase()]]
    : [];

/**
 * Aggregates data from different models with Sequelize, including filtering, searching, sorting, and pagination.
 * @param {Object} params - Configuration object.
 * @param {Object} params.baseModel - The base Sequelize model.
 * @param {Object[]} [params.includeModels=[]] - Models and their relations to include.
 * @param {Object} params.body - Request body with query parameters.
 * @param {string[]} [params.standardFields=[]] - Fields supporting equality filtering.
 * @param {string[]} [params.rangeFields=[]] - Fields supporting range filtering.
 * @param {string[]} [params.searchFields=[]] - Fields supporting search queries.
 * @param {string[]} [params.allowedSortFields=[]] - Fields allowed for sorting.
 * @param {string[]} [params.attributes=null] - Fields to select from the base model.
 * @returns {Promise<Object>} Aggregated data with pagination, sorting, and searching meta info.
 * @throws {Error} If data aggregation fails.
 */
const aggregateData = async ({
  baseModel,
  includeModels = [],
  body,
  standardFields = [],
  rangeFields = [],
  searchFields = [],
  allowedSortFields = [],
  attributes = null,
}) => {
  try {
    const allowedFilters = createAllowedFilters(standardFields, rangeFields);
    const where = buildWhereClause(body, allowedFilters, searchFields);
    const order = buildOrderClause(
      { sortBy: body.sortBy, sortOrder: body.sortOrder },
      allowedSortFields
    );

    const options = {
      where,
      attributes,
      include: includeModels,
      order,
    };

    return await paginate(
      baseModel.findAndCountAll.bind(baseModel),
      body,
      options
    );
  } catch (error) {
    throw new Error(`Data aggregation failed: ${error.message}`);
  }
};

module.exports = { aggregateData };
