const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: {
        type: String,
        ref: "TwitchUser",
        index: true,
    },
    tokenData: {
        accessToken: {
            type: String,
            required: true,
        },
        expiresIn: Number,
        obtainmentTimestamp: Number,
        refreshToken: String,
        scope: [String],
    },
});

module.exports = mongoose.model("TwitchToken", schema);
