const express = require("express");
const router = express.Router();

const role = require("./role");

const utils = require("../../../../utils");

const shardManager = require("../../../../twitch/objects/ShardManager");

router.get("/", (req, res) => {
    res.send("It exists, but we're not too sure what it does yet 🤔");
});

router.use("/:userId", async (req, res, next) => {
    try {
        req.target = await utils.Twitch.getUserById(req.params.userId, false, false);
        req.isOwned = req.ownedUsers.find(x => x._id === req.target._id) ? true : false;
        next();
    } catch(err) {
        console.error(err);
        res.status(404);
        res.json({ok: false, error: "The requested user was not found."});
    }
});

router.post("/:userId/join", async (req, res) => {
    if (req.isOwned) {
        const shard = shardManager.join(req.target.login);
        req.target.listening = true;
        await req.target.save();
        res.json({ok: true, shardId: shard.id});
    } else {
        res.status(403);
        res.json({ok: false, error: "You must own the channel to change bot status."});
    }
});

router.post("/:userId/part", async (req, res) => {
    if (req.isOwned) {
        const partedFrom = shardManager.part(req.target.login);
        req.target.listening = false;
        await req.target.save();
        res.json({ok: true, partedFrom});
    } else {
        res.status(403);
        res.json({ok: false, error: "You must own the channel to change bot status."});
    }
});

router.use("/:userId/role", role);

module.exports = router;
