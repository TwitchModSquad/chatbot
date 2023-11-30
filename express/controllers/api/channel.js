const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

const utils = require("../../../utils/");

const shardManager = require("../../../twitch/objects/ShardManager");

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

router.use(bodyParser.json());

router.post("/:userId/role", async (req, res) => {
    if (!req.body.hasOwnProperty("name")) {
        return res.json({ok: false, error: "Missing required property 'name'"});
    }
    if (!req.body.hasOwnProperty("description")) {
        req.body.description = "";
    }
    if (!req.body.hasOwnProperty("weight")) {
        return res.json({ok: false, error: "Missing required property 'weight'"});
    }
    let data = {
        name: req.body.name,
        description: req.body.description,
        weight: req.body.weight,
        channel: req.target._id,
    };
    utils.Twitch.RoleManager.createRole(data).then(role => {
        res.json({ok: true, data: role.api()});
    }, error => {
        res.json({ok: false, error});
    });
});

router.use("/:userId/role/:roleId", async (req, res, next) => {
    const userRoles = await utils.Twitch.RoleManager.getChannelRoles(req.target._id);
    req.role = userRoles.find(x => String(x._id) === req.params.roleId);
    if (req.role) {
        next();
    } else {
        console.error(err);
        res.status(404);
        res.json({ok: false, error: "The requested role was not found."});
    }
});

router.patch("/:userId/role/:roleId", async (req, res) => {
    utils.Twitch.RoleManager.editRole(req.role, req.body).then(role => {
        res.json({ok: true, data: role.api()});
    }, error => {
        res.json({ok: false, error});
    });
});

module.exports = router;
