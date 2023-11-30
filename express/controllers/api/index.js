const express = require("express");
const router = express.Router();

const channel = require("./channel");

router.get("/", (req, res) => {
    res.send("It exists, but we're not too sure what it does yet 🤔");
});

router.use("/channel", channel);

module.exports = router;
