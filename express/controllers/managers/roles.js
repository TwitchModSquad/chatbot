const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");
const config = require("../../../config.json");

router.get("/", async (req, res) => {
    const roles = await utils.Twitch.RoleManager.getChannelRoles(req.targetUser.user._id);
    res.render("pages/managers/roles", {
        roles,
        targetUser: req.targetUser,
        isOwned: req.isOwned,
        channels: req.twitchUsers,
        baseUri: config.express.host + req.targetUser.user._id + "/",
    });
});

module.exports = router;
