const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

router.post('/fragments', rawBody(), async (req, res) => {
  logger.info('Calling Http POST Method');
  try {
    // Check if the request body is a Buffer (parsed by the raw body parser)
    if (!Buffer.isBuffer(req.body)) {
      return res
        .status(415)
        .json({ error: { status: 'error', message: 'Unsupported Content-Type' } });
    }

    // Create a new fragment with metadata
    const fragment = new Fragment({
      ownerId: req.user, // Replace with actual user ID (from authentication)
      type: req.get('Content-Type'), // Get Content-Type from the request header
    });

    // Save the fragment metadata to the database
    await fragment.save();

    // Save the fragment data to the database
    await fragment.setData(req.body);

    // Construct the base URL for the fragment microservice
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;

    // Construct the full URL for the newly created fragment
    const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl);

    // Respond with HTTP 201 and Location header
    res
      .status(201)
      .location(location)
      .json({
        status: 'ok',
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      });

    logger.debug('A new fragment has been created');
  } catch (error) {
    // Log the error and respond with an appropriate error status
    logger.warn('Error creating fragment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
