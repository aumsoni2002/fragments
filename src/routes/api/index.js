// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

const { fetchUserFragments, fetchFragmentDataById, fetchFragmentInfoById } = require('./get');

// Define our first route, which will be: GET /v1/fragments

router.get('/fragments', fetchUserFragments);
router.get('/fragments/:id/info', fetchFragmentInfoById);
router.get('/fragments/:id', fetchFragmentDataById);

router.post('/fragments', require('./post'));

// Other routes (POST, DELETE, etc.) will go here later on...

module.exports = router;
