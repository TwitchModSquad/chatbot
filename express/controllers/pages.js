const express = require("express");
const router = express.Router();

const utils = require("../../utils/");
const config = require("../../config.json");

const chatbot = require("./chatbot/");

router.get("/", (req, res) => {
    res.render("pages/index", {
        targetUser: req.targetUser,
        channels: req.twitchUsers,
        baseUri: config.express.host + req.targetUser.user._id + "/",
    });
});

router.use("/bot", chatbot);

module.exports = router;
