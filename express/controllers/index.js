const express = require("express");
const router = express.Router();

const auth = require("./auth");
const api = require("./api");
const pages = require("./pages");

const utils = require("../../utils/");
const config = require("../../config.json");

router.use("/auth", auth);

let sessionCache = {};

router.use("/", async (req, res, next) => {
    const { cookies } = req;
    let sessionId;
    if (req.headers.authorization) {
        sessionId = req.headers.authorization;
    } else if (cookies?.sqa_session) {
        sessionId = cookies.sqa_session;
    }
    if (sessionId) {
        let session = sessionCache[sessionId];
        const start = Date.now();

        if (!session) {
            session = await utils.Schemas.Session.findById(sessionId)
                .populate("identity");
            sessionCache[sessionId] = session;
                console.log("getting session");
        }
        
        if (session?.identity) {
            req.session = session;
            req.ownedUsers = await req.session.identity.getTwitchUsers();
            req.twitchUsers = req.ownedUsers
                .map(x => {return {user: x, type: "Your Account"}});
console.log(Date.now() - start);
            // Utilize the "owned users" list to retrieve roles in which the user is a moderator/editor
            for (let i = 0; i < req.ownedUsers.length; i++) {
                const user = req.ownedUsers[i];
                const roles = await user.getChannelRoles();
                req.twitchUsers = req.twitchUsers.concat(
                    roles.filter(x => x.role.type === "editor")
                            .map(x => {return {user: x.channel, type: "Editor"}})
                );
                req.twitchUsers = req.twitchUsers.concat(
                    roles.filter(x => x.role.type === "moderator")
                            .map(x => {return {user: x.channel, type: "Moderator"}})
                );
            }

            // Removes potential duplicates from the Twitch User list
            let newUsers = [];
            req.twitchUsers.forEach(user => {
                if (!newUsers.find(x => x.user._id === user.user._id)) {
                    newUsers.push(user);
                }
            });
            req.twitchUsers = newUsers;
            if (req.twitchUsers.length > 0) {
                return next();
            }
        }
    }
    if (req.path.startsWith("/api/")) {
        res.status(401);
        res.json({ok: false, error: "Unauthorized"});
    } else {
        res.redirect(utils.Twitch.generateOAuthLink(config.twitch.default_scope));
    }
});

router.use("/api", api);

router.get("/", async (req, res) => {
    res.redirect(`${config.express.host}${encodeURIComponent(req.twitchUsers[0].user._id)}/`);
});

router.use("/:userId", async (req, res, next) => {
    // Select the target user (if possible) and serve the page (if possible)
    req.targetUser = req.twitchUsers.find(x => x.user._id === req.params.userId);

    if (req.targetUser) {
        req.isOwned = req.ownedUsers.find(x => x._id === req.targetUser.user._id) ? true : false;
        next();
    } else {
        res.redirect(`${config.express.host}${encodeURIComponent(req.twitchUsers[0].user._id)}/`);
    }
});

router.use("/:userId", pages);

module.exports = router;
