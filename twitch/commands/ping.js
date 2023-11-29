const { ChatMessage } = require("@twurple/chat");
const Shard = require("../objects/Shard");

const command = {
    name: "ping",
    description: "Pong!",
    /**
     * 
     * @param {Shard} shard 
     * @param {*} streamer 
     * @param {*} chatter 
     * @param {string[]} args 
     * @param {ChatMessage} message 
     */
    execute: (shard, streamer, chatter, args, message) => {
        shard.say(`@${chatter.display_name}, pong!`);
    }
};