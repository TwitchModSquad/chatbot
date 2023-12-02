const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    channel: {
        type: String,
        ref: "TwitchUser",
        index: true,
    },
    type: {
        type: String,
        enum: ["broadcaster", "editor","moderator","vip","subscriber","custom"],
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
        minlength: 0,
        maxlength: 200,
    },
});

schema.methods.api = function() {
    return {
        id: this._id,
        channel: this.channel?._id ? this.channel._id : this.channel,
        type: this.type,
        weight: this.weight,
        name: this.name,
        description: this.description,
    };
}

module.exports = mongoose.model("Role", schema);
