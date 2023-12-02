const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");
const config = require("../../../config.json");

router.get("/", async (req, res) => {
    const userRoles = await utils.Twitch.RoleManager.getChannelUsers(req.targetUser.user._id);
    const customRoles = (await utils.Twitch.RoleManager.getChannelRoles(req.targetUser.user._id))
        .filter(x => x.type === "custom");
    res.render("pages/chatbot/users", {
        userRoles,
        customRoles,
        targetUser: req.targetUser,
        channels: req.twitchUsers,
        baseUri: config.express.host + req.targetUser.user._id + "/",
        comma: utils.comma,
    });
});

module.exports = router;
