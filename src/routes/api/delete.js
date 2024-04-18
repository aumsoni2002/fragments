// src/routes/api/delete.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports.deleteFragment = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;
  try {
    await Fragment.delete(ownerId, fragmentId);
    return res.status(200).json(createSuccessResponse({}));
  } catch (err) {
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
