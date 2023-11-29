const express = require("express");
const router = express.Router();

const auth = require("./auth");

router.use("/auth", auth);

router.get("/", (req, res) => {
    res.render("pages/index");
});

module.exports = router;
