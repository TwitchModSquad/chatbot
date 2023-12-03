const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");
const config = require("../../../config.json");

const USERS_PER_PAGE = 20;

router.get("/", async (req, res) => {
    let channelUserRoles = await utils.Twitch.RoleManager.getChannelUsers(req.targetUser.user._id);
    const allRoles = await utils.Twitch.RoleManager.getChannelRoles(req.targetUser.user._id);
    const customRoles = allRoles.filter(x => x.type === "custom");

    let query = {
        username: req?.query?.username ? req.query.username : "",
        role: req?.query?.role ? req.query.role : "all",
    }

    if (query.username.length > 0) {
        channelUserRoles = channelUserRoles.filter(x => x.user.login.startsWith(req.query.username));
    }

    if (query.role !== "all") {
        channelUserRoles = channelUserRoles.filter(x => x.roles.find(y => String(y._id) === req.query.role));
    }

    // Pagination //
    let page = 1;

    if (req?.query?.page) {
        page = Number(req.query.page);
    }

    let users = channelUserRoles.length;
    let pages = Math.ceil(users / USERS_PER_PAGE);

    page = Math.max(Math.min(page, Math.ceil(users / pages)), 1);
    if (isNaN(page)) page = 1;

    let startIndex = (page - 1) * USERS_PER_PAGE;
    let endIndex = Math.min(startIndex + USERS_PER_PAGE, users);

    const userRoles = [];
    for (let i = startIndex; i < endIndex; i++) {
        userRoles.push(channelUserRoles[i]);
    }
console.log("RENDER: " + (Date.now() - req.start));
    // Render
    res.render("pages/chatbot/users", {
        userRoles,
        allRoles,
        customRoles,
        pagination: {
            page,
            pages,
            startIndex,
            endIndex,
        },
        query,
        targetUser: req.targetUser,
        channels: req.twitchUsers,
        baseUri: config.express.host + req.targetUser.user._id + "/",
        comma: utils.comma,
    });
});

module.exports = router;
