// src/routes/api/index.js

const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const { fetchUserFragments, fetchFragmentDataById, fetchFragmentInfoById } = require('./get');
const { postFragment } = require('./post');
const { putFragment } = require('./put');
const { deleteFragment } = require('./delete');

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () => {
  return express.raw({
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
};

// our routes
router.get('/fragments', fetchUserFragments);
router.get('/fragments/:id/info', fetchFragmentInfoById);
router.get('/fragments/:id', fetchFragmentDataById);

router.post('/fragments', rawBody(), postFragment);

router.put('/fragments/:id', rawBody(), putFragment);

router.delete('/fragments/:id', deleteFragment);

module.exports = router;
