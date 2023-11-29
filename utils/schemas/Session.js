const mongoose = require("mongoose");

const SESSION_LENGTH = 30 * 24 * 60 * 60 * 1000;
                    // 30 days

const schema = new mongoose.Schema({
    _id: {
        type: String,
        minlength: 64,
        maxlength: 64,
    },
    identity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Identity",
        index: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    used_at: {
        type: Date,
        default: Date.now,
    },
    expires_at: {
        type: Date,
        default: () => Date.now() + SESSION_LENGTH,
    }
});

module.exports = mongoose.model("Session", schema);
