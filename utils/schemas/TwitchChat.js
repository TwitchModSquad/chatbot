const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    channel: {
        type: String,
        ref: "TwitchUser",
        index: true,
    },
    chatter: {
        type: String,
        ref: "TwitchUser",
        index: true,
    },
    color: String,
    badges: String,
    emotes: String,
    message: String,
    time_sent: Date,
    deleted: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("TwitchChat", schema);
