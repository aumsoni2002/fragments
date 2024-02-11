// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand == 1 ? true : false;

    const fragmentId = req.params.id;

    if (fragmentId != null) {
      const fragment = await Fragment.byId(req.user, fragmentId);

      if (!fragment) {
        // If fragment with the given ID is not found, return 404 error
        return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
      } else {
        return res.status(200).json(createSuccessResponse({ fragment }));
      }
    }

    const fragments = await Fragment.byUser(req.user, expand);

    // Send the fragment IDs in the response
    res.status(200).json(createSuccessResponse({ fragments: fragments }));
  } catch (error) {
    // Handle errors
    console.error('Error fetching fragments:', error);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
