const {ChatClient} = require("@twurple/chat");

const config = require("../../config.json");
const utils = require("../../utils/");

class Shard {

    /**
     * The shard ID
     * @type {string}
     */
    id;

    /**
     * The ChatClient for this Shard
     * @type {ChatClient}
     */
    client = null;

    /**
     * Joins a channel with this shard
     * @param {string} channel 
     * @returns {Promise<void>}
     */
    join(channel) {
        return this.client.join(channel);
    }

    /**
     * Parts from a channel with this shard
     * @param {string} channel 
     */
    part(channel) {
        return this.client.part(channel);
    }

    constructor(channels) {
        this.id = "s-" + utils.stringGenerator(5);
        this.client = new ChatClient({
            authProvider: utils.Twitch.authProvider,
            channels: channels,
        });
        this.client.connect();
    }

}

module.exports = Shard;
