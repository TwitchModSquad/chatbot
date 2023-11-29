const mongoose = require("mongoose");

const config = require("../../config.json");

const Identity = require("./Identity");

const Session = require("./Session");

const TwitchCommand = require("./TwitchCommand");
const TwitchToken = require("./TwitchToken");
const TwitchUser = require("./TwitchUser");
const TwitchUserHistory = require("./TwitchUserHistory");

class Schemas {

    Identity = Identity;

    Session = Session;
    
    TwitchCommand = TwitchCommand;
    TwitchToken = TwitchToken;
    TwitchUser = TwitchUser;
    TwitchUserHistory = TwitchUserHistory;

    async schema() {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(config.mongodb.url);
        console.log("Connected to MongoDB!");
    }

    constructor() {
        this.schema();
    }

}

module.exports = new Schemas();
