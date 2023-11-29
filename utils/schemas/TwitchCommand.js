const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: {
        type: String,
        ref: "TwitchUser",
        index: true,
        required: true,
    },
    command: {
        name: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 100,
        },
        command: {
            type: String,
            enum: ["ping"],
        },
        text: {
            type: String,
            minlength: 1,
            maxlength: 250,
        },
    }
});

module.exports = mongoose.model("TwitchCommand", schema);
