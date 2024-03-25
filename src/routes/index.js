// src/routes/index.js

const express = require('express');

const { createSuccessResponse } = require('../response');

// author and version from our package.json file
// TODO: make sure you have updated your name in the `author` section
const { version, author } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

// Our authentication middleware
const { authenticate } = require('../auth');

const { hostname } = require('os');

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/aumsoni2002/fragments',
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});

module.exports = router;
