const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    channel: {
        type: String,
        ref: "TwitchUser",
        index: true,
        required: true,
    },
    user: {
        type: String,
        ref: "TwitchUser",
        index: true,
        required: true,
    },
    role: {
        type: String,
        enum: ["editor","moderator","vip","subscriber","custom"],
        default: "custom",
        index: true,
        required: true,
    },
    customRole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TwitchRole",
        index: true,
    },
    first_seen: {
        type: Date,
        default: Date.now,
        required: true,
    },
    last_seen: {
        type: Date,
        default: null,
        required: true,
    }
});

module.exports = mongoose.model("TwitchUserRole", schema);
