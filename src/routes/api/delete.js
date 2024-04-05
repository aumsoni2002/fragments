// src/routes/api/delete.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Deleting a fragment by id
module.exports.deleteFragment = async (req, res) => {
  const fragmentId = req.params.id;
  const userId = req.user;

  logger.info({ fragmentId, userId }, `Requesting: DELETE ${req.originalUrl}`);

  try {

    await Fragment.delete(userId, fragmentId);
    logger.info(`Fragment was deleted`);
    const successResponse = createSuccessResponse({});
    return res.status(200).json(successResponse);

  } catch (err) {

    const errorResponse = createErrorResponse(404, err.message);
    logger.error({ errorResponse }, 'Failed to delete the fragment');
    return res.status(404).json(errorResponse);
    
  }
};
