const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

const utils = require("../../../../utils/");

router.use(bodyParser.json());

router.get("/", async (req, res) => {
    let userRoles = await utils.Twitch.RoleManager.getChannelRoles(req.target._id);

    if (req?.query?.type) {
        if (typeof(req.query.type) === "object") {
            userRoles = userRoles.filter(x => req.query.type.includes(x.type));
        } else {
            userRoles = userRoles.filter(x => x.type === req.query.type);
        }
    }

    if (req?.query?.weight) {
        userRoles = userRoles.filter(x => String(x.weight) === req.query.weight);
    }
    
    res.json({
        ok: true,
        data: userRoles.map(x => x.api()),
    });
});

router.post("/", async (req, res) => {
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

router.use("/:roleId", async (req, res, next) => {
    const userRoles = await utils.Twitch.RoleManager.getChannelRoles(req.target._id);
    req.role = userRoles.find(x => String(x._id) === req.params.roleId);
    if (req.role) {
        next();
    } else {
        res.status(404);
        res.json({ok: false, error: "The requested role was not found."});
    }
});

router.get("/:roleId", async (req, res) => {
    res.json({ok: true, data: req.role.api()});
});

router.patch("/:roleId", async (req, res) => {
    utils.Twitch.RoleManager.editRole(req.role, req.body).then(role => {
        res.json({ok: true, data: role.api()});
    }, error => {
        res.json({ok: false, error});
    });
});

router.delete("/:roleId", async (req, res) => {
    utils.Twitch.RoleManager.deleteRole(req.role).then(data => {
        res.json({ok: true, data});
    }, error => {
        res.json({ok: false, error});
    });
});

module.exports = router;
