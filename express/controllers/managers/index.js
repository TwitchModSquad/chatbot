const express = require("express");
const router = express.Router();

const roles = require("./roles");
const users = require("./users");

router.use("/roles", roles);
router.use("/users", users);

module.exports = router;
