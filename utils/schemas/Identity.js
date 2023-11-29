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

schema.methods.getTwitchUsers = async function() {
    return await TwitchUser.find({identity: this})
        .populate("identity");
}

module.exports = mongoose.model("Identity", schema);
