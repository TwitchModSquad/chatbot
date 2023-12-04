const express = require("express");
const router = express.Router();

const commands = require("./commands");

router.use("/commands", commands);

module.exports = router;
