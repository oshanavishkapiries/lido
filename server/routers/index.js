const express = require('express');
const router = express.Router();

// fuctions
const getServerStatus = require('../utils/helthcheck')

// Routers
const testRouter = require('../routers/testRouter');

router.use('/health', getServerStatus)
router.use('/test', testRouter);


module.exports = router;