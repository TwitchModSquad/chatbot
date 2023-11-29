const express = require("express");
const router = express.Router();

const utils = require("../../utils/");
const config = require("../../config.json");

const shardManager = require("../../twitch/objects/ShardManager");

const chatbot = require("./chatbot/");

router.get("/", (req, res) => {
    const currentShard = shardManager.getChannelShard(req.targetUser.user.login);
    res.render("pages/index", {
        currentShard,
        targetUser: req.targetUser,
        channels: req.twitchUsers,
        baseUri: config.express.host + req.targetUser.user._id + "/",
    });
});

router.use("/bot", chatbot);

module.exports = router;
