const fs = require("fs");

const utils = require("../../utils/");
const Shard = require("./Shard");

const grabFiles = path => fs.readdirSync(path).filter(file => file.endsWith('.js'));

const MAX_CHANNELS_PER_SHARD = 10;

const commandFiles = grabFiles("./twitch/commands/");
const listenerFiles = grabFiles("./twitch/listeners/");

const commands = [];
const listeners = [];

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command);
}

for (const file of listenerFiles) {
    const listener = require(`../listeners/${file}`);
    listeners.push(listener);
}

const listenerType = {
    message: listeners.filter(x => x.event === "message"),
};

for (const event in listenerType) {
    console.log(`Loaded ${listenerType[event].length} ${event} listeners`)
}

class ShardManager {

    /**
     * Stores all of the Shards currently in use
     * @type {Shard[]}
     */
    shards = [];

    commands = commands;
    listeners = listeners;

    /**
     * Creates a new Shard with the listed channels
     * @param {string[]} channels 
     * @returns {Shard}
     */
    #createShard(channels = []) {
        const shard = new Shard(channels);

        shard.client.onMessage(async (_, __, text, message) => {
            if (message.channelId && message.userInfo?.userId) {
                try {
                    const channel = await utils.Twitch.getUserById(message.channelId, false, true);
                    const user = await utils.Twitch.getUserById(message.userInfo.userId, false, true);

                    listenerType.message.forEach(listener => {
                        try {
                            listener.execute(shard, channel, user, text, message);
                        } catch(err) {
                            console.error(`Error in listener ${listener.name}:`)
                            console.error(err);
                        }
                    });
                } catch(err) {
                    console.error(err);
                }
            }
        });

        this.shards.push(shard);
        return shard;
    }

    /**
     * Joins a Channel
     * @param {string} channel 
     * @returns {Shard} The Shard the channel was added to / already existed on
     */
    join(channel) {
        channel = "#" + channel.replace("#","").toLowerCase();
        let chosenShard = null;
        for (let i = 0; i < this.shards.length; i++) {
            const shard = this.shards[i];
            if (shard.client.currentChannels.includes(channel)) {
                return shard;
            }
            if (shard.client.currentChannels.length < MAX_CHANNELS_PER_SHARD) {
                chosenShard = shard;
            }
        }
        if (chosenShard !== null) {
            chosenShard = this.#createShard([channel]);
        } else {
            chosenShard.join(channel);
        }
        return chosenShard;
    }

    /**
     * Parts a Channel
     * @param {string} channel 
     * @returns {number} # of shards removed from
     */
    part(channel) {
        let removedFrom = 0;
        channel = "#" + channel.replace("#","").toLowerCase();
        for (let i = 0; i < this.shards.length; i++) {
            const shard = this.shards[i];
            if (shard.client.currentChannels.includes(channel)) {
                shard.part(channel)
                removedFrom++;
            }
        }
        return removedFrom;
    }

    /**
     * Retrieves the shard of the specified channel, if applicable
     * @param {string} channel
     * @returns {Shard?}
     */
    getChannelShard(channel) {
        channel = "#" + channel.replace("#","").toLowerCase();
        for (let i = 0; i < this.shards.length; i++) {
            const shard = this.shards[i];
            if (shard.client.currentChannels.includes(channel)) {
                return shard;
            }
        }
        return null;
    }

    constructor() {
        utils.Schemas.TwitchUser.find({listening: true}).then(channels => {
            channels = channels.map(x => x.login);

            let channelStack = [];

            for (let i = 0; i < channels.length; i++) {
                channelStack.push(channels[i]);
                if (i % MAX_CHANNELS_PER_SHARD === MAX_CHANNELS_PER_SHARD - 1) {
                    this.#createShard(channelStack);
                    channelStack = [];
                }
            }
            if (channelStack.length > 0) {
                this.#createShard(channelStack);
            }

            console.log(`Joining ${channels.length} channels across ${this.shards.length} shards`);
        }, console.error);
    }

}

module.exports = new ShardManager();
