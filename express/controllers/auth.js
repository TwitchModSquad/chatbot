const express = require("express")
const router = express.Router();

const utils = require("../../utils/");
const config = require("../../config.json");

router.get("/", async (req, res) => {
    if (req?.query?.code) {
        try {
            const userId = await utils.Twitch.authProvider.addUserForCode(req.query.code);
            const user = await utils.Twitch.getUserById(userId);

            if (userId === config.twitch.id) return res.send("You may not authenticate with this user.");
    
            const accessToken = await utils.Twitch.authProvider.getAccessTokenForUser(user._id);
            await utils.Schemas.TwitchToken.findOneAndUpdate({
                user: user._id,
            }, {
                user: user._id,
                tokenData: accessToken,
            }, {
                upsert: true,
                new: true,
            });

            const identity = await user.createIdentity();

            const session = await utils.Schemas.Session.create({
                _id: utils.stringGenerator(64),
                identity: identity,
            });

            res.cookie("sqa_session", session._id, {
                expires: session.expires_at,
                path: "/",
                domain: config.express.domain,
                httpOnly: true,
                secure: true,
            });

            res.redirect(config.express.host);

            user.updateRoles();
            return;
        } catch(err) {
            console.error(err);
        }
    }

    res.redirect(utils.Twitch.generateOAuthLink(config.twitch.default_scope));
});

module.exports = router;
