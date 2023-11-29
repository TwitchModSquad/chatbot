const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    let channels = req.twitchUsers;

    res.render("pages/index", {targetUser: req.targetUser, channels: channels});
});

module.exports = router;
