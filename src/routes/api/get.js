// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const md = require('markdown-it')();
const { htmlToText } = require('html-to-text');
const sharp = require('sharp');

// fetching all fragments of a current user
module.exports.fetchUserFragments = async (req, res, next) => {
  const userId = req.user;
  const hasExpand = req.query.expand == 1 ? true : false;

  logger.info({ userId, hasExpand }, `Request received: GET ALL ${req.originalUrl}`);

  try {
    const fragments = await Fragment.byUser(userId, hasExpand);
    const successResponse = createSuccessResponse({ fragments: fragments });
    logger.debug({ fragments }, 'Fragments retrieved for the user');
    res.status(200).json(successResponse);
  } catch (err) {
    logger.warn({ err }, 'Failed to retrieve user fragments');
    next(err);
  }
};

// fetching the actual fragment data by Id
module.exports.fetchFragmentDataById = async (req, res) => {
  const userId = req.user;
  const [id, extension] = req.params.id.split('.');

  logger.info({ id, userId, extension }, `Request received: GET DATA BY ID ${req.originalUrl}`);

  try {
    const fragment = await Fragment.byId(userId, id);
    const data = await fragment.getData();
    logger.debug('Fragment data retrieved');

    // trying to convert data from its own extension to other extension and then return it
    if (extension != null) {
      const extensionType = getExtensionContentType(extension);

      if (fragment.formats.includes(extensionType)) {
        const convertedData = await convertData(data, fragment.mimeType, extension);
        logger.info('The Fragment data has been converted:', {
          from: fragment.mimeType,
          to: extensionType,
        });
        res.setHeader('Content-Type', extensionType);
        res.status(200).send(convertedData);
      } else {
        const message = `a ${fragment.mimeType} fragment cannot be return as a ${extension}`;
        const errorResponse = createErrorResponse(415, message);
        logger.error({ userId, errorResponse }, 'Invalid conversion');
        res.status(415).json(errorResponse);
      }
    }
    // returning raw fragment data with its type as it was not able to converted
    else {
      res.setHeader('Content-Type', fragment.type);
      res.status(200).send(data);
    }
  } catch (err) {
    const errorResponse = createErrorResponse(404, err.message);
    logger.warn({ id, errorResponse }, 'Failed in retrieving fragment data');
    res.status(404).json(errorResponse);
  }
};

// fetching the meta data of a fragment by its id.
module.exports.fetchFragmentInfoById = async (req, res) => {
  const id = req.params.id;
  const userId = req.user;

  logger.info({ id, userId }, `Request received: GET INFO BY ID ${req.originalUrl}`);

  try {
    const fragment = await Fragment.byId(userId, id);
    logger.info({ fragment }, 'Fragment has been found');

    const successResponse = createSuccessResponse({ fragment: fragment });
    res.status(200).json(successResponse);
  } catch (err) {
    const errorResponse = createErrorResponse(404, err.message);

    logger.error({ errorResponse }, 'Failed in retrieving requested fragment information');
    res.status(404).json(errorResponse);
  }
};

// getting extension as per its respective content type
const getExtensionContentType = (extension) => {
  switch (extension) {
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
};

// Converting data from one extension to other extension
const convertData = async (fragmentData, from, to) => {
  let convertedData = fragmentData;

  switch (from) {
    case 'text/markdown':
      if (to == 'txt') {
        convertedData = md.render(fragmentData.toString());
        convertedData = htmlToText(convertedData.toString(), { wordwrap: 150 });
      }
      if (to == 'html') {
        convertedData = md.render(fragmentData.toString());
      }
      break;

    case 'text/html':
      if (to == 'txt') {
        convertedData = htmlToText(fragmentData.toString(), { wordwrap: 130 });
      }
      break;

    case 'application/json':
      if (to == 'txt') {
        convertedData = JSON.parse(fragmentData.toString());
      }
      break;
    case 'image/png':
      if (to == 'jpg') {
        convertedData = await sharp(fragmentData).jpeg().toBuffer();
      }
      if (to == 'webp') {
        convertedData = await sharp(fragmentData).webp().toBuffer();
      }
      if (to == 'gif') {
        convertedData = await sharp(fragmentData).gif().toBuffer();
      }
      break;

    case 'image/jpeg':
      if (to == 'png') {
        convertedData = await sharp(fragmentData).png().toBuffer();
      }
      if (to == 'webp') {
        convertedData = await sharp(fragmentData).webp().toBuffer();
      }
      if (to == 'gif') {
        convertedData = await sharp(fragmentData).gif().toBuffer();
      }
      break;

    case 'image/webp':
      if (to == 'png') {
        convertedData = await sharp(fragmentData).png().toBuffer();
      }
      if (to == 'jpg') {
        convertedData = await sharp(fragmentData).jpeg().toBuffer();
      }
      if (to == 'gif') {
        convertedData = await sharp(fragmentData).gif().toBuffer();
      }
      break;

    case 'image/gif':
      if (to == 'png') {
        convertedData = await sharp(fragmentData).png().toBuffer();
      }
      if (to == 'jpg') {
        convertedData = await sharp(fragmentData).jpeg().toBuffer();
      }
      if (to == 'webp') {
        convertedData = await sharp(fragmentData).webp().toBuffer();
      }
      break;
  }

  logger.debug(`Fragment data was successfully converted from ${from} to ${to}`);
  return Promise.resolve(convertedData);
};
