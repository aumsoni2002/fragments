// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports.postFragment = async (req, res) => {
  const ownerId = req.user;
  const type = req.get('Content-Type');
  const body = req.body;
  try {
    const fragment = new Fragment({ ownerId: ownerId, type: type });
    await fragment.setData(body);
    await fragment.save();
    let baseUrl;
    if (process.env.API_URL) {
      baseUrl = process.env.API_URL;
    } else {
      baseUrl = req.headers.host;
    }
    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);
    res.set('Access-Control-Expose-Headers', 'Location');
    res.status(201).json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    res.status(415).json(createErrorResponse(415, 'Unsupported content type'));
  }
};
