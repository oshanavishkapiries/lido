const express = require("express");
const router = express.Router();

// fuctions
const getServerStatus = require("../utils/helthcheck");

// Routers
const testRouter = require("../routers/testRouter");
const sessionRouter = require("../routers/sessionRouter");
const messageRouter = require("../routers/messageRouter");
const pollRouter = require("../routers/pollRouter");

router.use("/health", getServerStatus);
router.use("/test", testRouter);
router.use("/session", sessionRouter);
router.use("/messages", messageRouter);
router.use("/polls", pollRouter);

module.exports = router;

