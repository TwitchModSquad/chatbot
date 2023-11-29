const mongoose = require("mongoose");

const TwitchUserHistory = require("./TwitchUserHistory");

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    login: {
        type: String,
        minLength: 1,
        maxLength: 25,
        required: true,
        index: true,
    },
    display_name: {
        type: String,
        minLength: 1,
        maxLength: 25,
        required: true,
    },
    identity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Identity",
        index: true,
    },
    type: {
        type: String,
        enum: ["", "admin", "global_mod", "staff"],
        default: "",
    },
    broadcaster_type: {
        type: String,
        enum: ["", "affiliate", "partner"],
        default: "",
    },
    follower_count: Number,
    description: String,
    profile_image_url: String,
    offline_image_url: String,
    available: {
        type: Boolean,
        default: true,
        required: true,
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: true,
    },
    first_seen: {
        type: Date,
        default: Date.now,
        required: true,
    },
    last_seen: {
        type: Date,
        default: Date.now,
        required: true,
    },
    listening: {
        type: Boolean,
        required: true,
        default: false,
        index: true,
    },
});

const TRACKED_CHANGES = [
    "login",
    "type",
    "broadcaster_type",
    "description",
    "profile_image_url",
    "offline_image_url",
];

const HELIX_PARAMS = [
    "name",
    "type",
    "broadcasterType",
    "description",
    "profilePictureUrl",
    "offlinePlaceholderUrl",
];

const VALID_TYPES = [
    "string",
    "number",
    "boolean",
];

schema.methods.updateData = async function(updateFollowers = true) {
    let helixUser = await global.utils.Twitch.raw.users.getUserByIdBatched(this._id);

    if (helixUser) {
        if (!this.available) {
            this.available = true;
            await TwitchUserHistory.create({
                user: this._id,
                parameter: "availability",
                old: {
                    boolean: false,
                },
                new: {
                    boolean: true,
                }
            });
        }

        if (updateFollowers) {
            const followers = await global.utils.Twitch.raw.channels.getChannelFollowerCount(this._id);
            
            if (followers) {
                await TwitchUserHistory.create({
                    user: this._id,
                    parameter: "follower_count",
                    old: {
                        number: this.follower_count,
                    },
                    new: {
                        number: followers,
                    }
                });
    
                this.follower_count = followers;
            }
        }

        for (let i = 0; i < TRACKED_CHANGES.length; i++) {
            const storeParam = this[TRACKED_CHANGES[i]];
            const helixParam = helixUser[HELIX_PARAMS[i]];
            if (storeParam !== helixParam) {
                let data = {
                    user: this._id,
                    parameter: TRACKED_CHANGES[i],
                };
    
                if (VALID_TYPES.includes(typeof(storeParam))) {
                    data.old = {};
                    data.old[typeof(storeParam)] = storeParam;
                }
                if (VALID_TYPES.includes(typeof(helixParam))) {
                    data.new = {};
                    data.new[typeof(helixParam)] = helixParam;
                }
    
                await TwitchUserHistory.create(data);
            }
        }
    
        this.login = helixUser.name;
        this.display_name = helixUser.displayName;
        this.type = helixUser.type;
        this.broadcaster_type = helixUser.broadcasterType;
        this.description = helixUser.description;
        this.profile_image_url = helixUser.profilePictureUrl;
        this.offline_image_url = helixUser.offlinePlaceholderUrl;
    } else {
        if (this.available) {
            this.available = false;
            await TwitchUserHistory.create({
                user: this._id,
                parameter: "availability",
                old: {
                    boolean: true,
                },
                new: {
                    boolean: false,
                }
            })
        }
    }

    this.updated_at = Date.now();
    await this.save();

    return this;
}

schema.methods.createIdentity = async function() {
    if (this.identity) return this.identity;

    this.identity = await global.utils.Schemas.Identity.create({});

    await this.save();

    return this.identity;
}

module.exports = mongoose.model("TwitchUser", schema);
