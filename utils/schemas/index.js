const mongoose = require("mongoose");

const config = require("../../config.json");

const Identity = require("./Identity");

const Session = require("./Session");

const TwitchChat = require("./TwitchChat");
const TwitchCommand = require("./TwitchCommand");
const TwitchRole = require("./TwitchRole");
const TwitchToken = require("./TwitchToken");
const TwitchUser = require("./TwitchUser");
const TwitchUserHistory = require("./TwitchUserHistory");

class Schemas {

    Identity = Identity;

    Session = Session;
    
    TwitchChat = TwitchChat;
    TwitchCommand = TwitchCommand;
    TwitchRole = TwitchRole;
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
