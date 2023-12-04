const express = require("express");
const router = express.Router();

const utils = require("../../../utils");
const config = require("../../../config.json");

router.get("/", (req, res) => {
    res.render("pages/routines/commands", {
        targetUser: req.targetUser,
        channels: req.twitchUsers,
        baseUri: config.express.host + req.targetUser.user._id + "/",
    });
});

module.exports = router;
