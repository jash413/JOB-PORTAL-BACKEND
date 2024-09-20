// utils/aggregator.js
const { paginate } = require("./pagination");

/**
 * Dynamically aggregates data from different models with Sequelize and pagination.
 *
 * @param {Object} baseModel - The base Sequelize model (e.g., Candidate).
 * @param {Array} includeModels - Array of objects defining models and their relations.
 *        Each object can define:
 *        - model: Sequelize model to include (e.g., JobCategory)
 *        - as: Alias for the model (e.g., 'jobCategory')
 *        - attributes: Fields to select from the model
 * @param {Object} query - Request query object containing pagination parameters.
 * @param {Object} where - (Optional) Where clause for filtering the base model.
 * @param {Array} attributes - (Optional) Fields to select from the base model.
 *
 * @returns {Object} Aggregated data from the models, with pagination meta info.
 */
const aggregateData = async ({
  baseModel,
  includeModels = [],
  query,
  where = {},
  attributes = null,
}) => {
  try {
    // Set up options for the Sequelize query
    const options = {
      where,
      attributes,
      include: includeModels,
    };

    // Use the paginate utility to handle pagination logic and fetch paginated results
    const paginatedResults = await paginate(
      baseModel.findAndCountAll.bind(baseModel),
      query,
      options
    );

    return paginatedResults;
  } catch (error) {
    throw new Error(`Error in data aggregation: ${error.message}`);
  }
};

module.exports = { aggregateData };
