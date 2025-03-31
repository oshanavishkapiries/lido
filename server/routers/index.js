const express = require("express");
const router = express.Router();

// fuctions
const getServerStatus = require("../utils/helthcheck");

// Routers
const testRouter = require("../routers/testRouter");
const sessionRouter = require("../routers/sessionRouter");

router.use("/health", getServerStatus);
router.use("/test", testRouter);
router.use("/session", sessionRouter);

module.exports = router;
