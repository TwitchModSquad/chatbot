const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: {
        type: String,
        ref: "TwitchUser",
        index: true,
        required: true,
    },
    parameter: {
        type: String,
        index: true,
        required: true,
        enum: ["login","type","broadcaster_type","follower_count","description","profile_image_url","offline_image_url","availability"],
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    old: {
        string: String,
        number: Number,
        boolean: Boolean,
    },
    new: {
        string: String,
        number: Number,
        boolean: Boolean,
    },
});

module.exports = mongoose.model("TwitchUserHistory", schema);
