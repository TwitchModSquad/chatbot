const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    channel: {
        type: String,
        ref: "TwitchUser",
        index: true,
    },
    type: {
        type: String,
        enum: ["editor","moderator","vip","subscriber","custom"],
        default: "custom",
        index: true,
        required: true,
    },
    weight: {
        type: Number,
        min: 0,
        max: 10000,
        required: true,
    },
    name: {
        type: String,
        minlength: 2,
        maxlength: 50,
        required: true,
    },
    description: {
        type: String,
        minlength: 2,
        maxlength: 200,
    },
    aliases: {
        type: [String],
        required: true,
        default: [],
    },
});

module.exports = mongoose.model("TwitchRole", schema);
