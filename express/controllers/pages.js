const express = require("express");
const router = express.Router();

const config = require("../../config.json");

const shardManager = require("../../twitch/objects/ShardManager");

const managers = require("./managers/");
const routines = require("./routines/");

router.get("/", (req, res) => {
    const currentShard = shardManager.getChannelShard(req.targetUser.user.login);
    res.render("pages/index", {
        currentShard,
        isOwned: req.isOwned,
        targetUser: req.targetUser,
        channels: req.twitchUsers,
        baseUri: config.express.host + req.targetUser.user._id + "/",
    });
});

router.use("/managers", managers);
router.use("/routines", routines);

module.exports = router;
