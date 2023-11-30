const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");

const shardManager = require("../../../twitch/objects/ShardManager");

router.get("/", (req, res) => {
    res.send("It exists, but we're not too sure what it does yet 🤔");
});

router.post("/:userId/join", async (req, res) => {
    try {
        const target = await utils.Twitch.getUserById(req.params.userId, false, false);
        if (req.ownedUsers.find(x => x._id === target._id)) {
            const shard = shardManager.join(target.login);
            target.listening = true;
            await target.save();
            res.json({ok: true, shardId: shard.id});
        } else {
            res.status(403);
            res.json({ok: false, error: "You must own the channel to change bot status."});
        }
    } catch(err) {
        console.error(err);
        res.status(404);
        res.json({ok: false, error: "The requested user was not found."});
    }
});

router.post("/:userId/part", async (req, res) => {
    try {
        const target = await utils.Twitch.getUserById(req.params.userId, false, false);
        if (req.ownedUsers.find(x => x._id === target._id)) {
            const removedFrom = shardManager.part(target.login);
            target.listening = false;
            await target.save();
            res.json({ok: true, removedFrom: removedFrom});
        } else {
            res.status(403);
            res.json({ok: false, error: "You must own the channel to change bot status."});
        }
    } catch(err) {
        console.error(err);
        res.status(404);
        res.json({ok: false, error: "The requested user was not found."});
    }
});

module.exports = router;
