const { ChatMessage } = require("@twurple/chat");
const Shard = require("../objects/Shard");

const utils = require("../../utils/");

const listener = {
    name: "messageLog",
    event: "message",
    /**
     * Executor for this Listener
     * @param {Shard} shard 
     * @param {*} channel 
     * @param {*} chatter 
     * @param {string} text 
     * @param {ChatMessage} message 
     */
    execute: async (shard, channel, chatter, text, message) => {
        try {
            let badges = null;
            let emotes = null;

            if (message?.userInfo?.badges?.size > 0) {
                badges = "";
                message.userInfo.badges.forEach((val, key) => {
                    if (badges !== "") badges += ",";
                    badges += `${key}/${val}`;
                });
            }
            if (message?.emoteOffsets.size > 0) {
                emotes = "";
                message.emoteOffsets.forEach((val, key) => {
                    if (emotes !== "") emotes += "/";
                    emotes += `${key}:${val.join(",")}`;
                });
            }

            await utils.Schemas.TwitchChat.findOneAndUpdate({
                _id: message.id,
            }, {
                _id: message.id,
                channel,
                chatter,
                color: message?.userInfo?.color ? message.userInfo.color : null,
                badges: badges,
                emotes: emotes,
                message: text,
                time_sent: message.date,
            }, {
                upsert: true,
                new: true,
            });
        } catch(err) {
            console.error(err);
        }
    },
}

module.exports = listener;
