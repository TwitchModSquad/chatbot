const mongoose = require("mongoose");

const TwitchUser = require("./TwitchUser");

const schema = new mongoose.Schema({
    settings: {
        defaultPrefix: {
            type: String,
            default: "!",
            minlength: 1,
            maxlength: 5,
        },
    },
});

let userCache = {};

schema.methods.clearUserCache = async function() {
    delete userCache[String(this._id)];
}

schema.methods.getTwitchUsers = async function() {
    let users;
    if (userCache.hasOwnProperty(String(this._id))) {
        users = userCache[String(this._id)].twitchUsers;
    }
    if (!users) {
        console.log("retrieve users");
        users = await TwitchUser.find({identity: this})
            .populate("identity");
        if (!userCache.hasOwnProperty(String(this._id))) {
            userCache[String(this._id)] = {
                twitchUsers: null,
                discordUsers: null,
            };
        }
        userCache[String(this._id)].twitchUsers = users;
    }
    return users;
}

module.exports = mongoose.model("Identity", schema);
