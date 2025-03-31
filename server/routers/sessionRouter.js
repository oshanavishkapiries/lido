const express = require('express');
const { createSession } = require('../controller/sessionController');

const router = express.Router();

router.post('/create', createSession);

module.exports = router;