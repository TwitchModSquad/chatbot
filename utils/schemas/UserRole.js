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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
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
    }
});

module.exports = mongoose.model("UserRole", schema);
