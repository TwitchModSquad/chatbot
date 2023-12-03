const express = require("express");
const path = require("path");
const app = express();

const cookieParser = require("cookie-parser");

const config = require("../config.json");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static("express/static"));

app.use(cookieParser());

app.use(req => {
    req.startTime = Date.now();
});

const controllers = require("./controllers/");
app.use("/", controllers);

app.listen(config.express.port, () => {
    console.log(`Express is listening to port ${config.express.port}`);
});
