const express = require("express");
const router = express.Router();

const commands = require("./commands");
const roles = require("./roles");
const users = require("./users");

router.use("/commands", commands);
router.use("/roles", roles);
router.use("/users", users);

module.exports = router;
