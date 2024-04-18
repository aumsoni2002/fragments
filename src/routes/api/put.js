// src/routes/api/put.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports.putFragment = async (req, res) => {
  const id = req.params.id;
  const ownerId = req.user;
  const type = req.get('Content-Type');
  const body = req.body;
  try {
    const fragment = await Fragment.byId(ownerId, id);

    if (fragment.type == type) {
      await fragment.setData(body);
      await fragment.save();
      res.status(200).json(createSuccessResponse({ fragment: fragment }));
    } else {
      return res
        .status(400)
        .json(createErrorResponse(400, 'Fragment type cannot be changed after creation'));
    }
  } catch (err) {
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
