const {ApiClient} = require("@twurple/api");
const {RefreshingAuthProvider} = require("@twurple/auth");
const {EventSubWsListener} = require("@twurple/eventsub-ws");

const config = require("../../config.json");

const Cache = require("../cache/Cache");

const TwitchUser = require("../schemas/TwitchUser");
const TwitchToken = require("../schemas/TwitchToken");

const RoleManager = require("./RoleManager");
const UserRoleManager = require("./UserRoleManager");

const authProvider = new RefreshingAuthProvider({
    clientId: config.twitch.client_id,
    clientSecret: config.twitch.client_secret,
    redirectUri: config.express.host + "auth",
});

authProvider.onRefresh(async (userId, tokenData) => {
    console.log("refreshing token for " + userId);
    await TwitchToken.findOneAndUpdate({
        user: userId,
    }, {
        tokenData,
    }, {
        upsert: true,
        new: true,
    });
});

(async () => {
    const tokens = await TwitchToken.find({});

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        authProvider.addUser(token.user, token.tokenData);
    }

    console.log(`Added ${tokens.length} pre-existing tokens`);
    
    authProvider.addIntentsToUser(config.twitch.id, ["chat"]);
})();

const api = new ApiClient({ authProvider });

class Twitch {

    /**
     * Global AuthProvider for the Twitch API
     * @type {RefreshingAuthProvider}
     */
    authProvider = authProvider;

    /**
     * Raw Twitch api provided by twurple
     * @type {ApiClient}
     */
    raw = api;

    /**
     * EventSub Listener
     * @type {EventSubWsListener}
     */
    eventSub = new EventSubWsListener({ apiClient: api });

    /**
     * Role manager
     * @type {RoleManager}
     */
    RoleManager = new RoleManager();

    /**
     * User role manager
     * @type {UserRoleManager}
     */
    UserRoleManager = new UserRoleManager();

    /**
     * Cache for Twitch users
     * @type {Cache}
     */
    userCache = new Cache(1 * 60 * 60 * 1000); // 1 hour cache

    /**
     * Simple cache of username-ID pairs for quickly retrieving user names
     */
    nameCache = {};

    /**
     * Generates an OAuth2 link for Twitch with the provided scope
     * @param {string[]} scope
     * @returns {string}
     */
    generateOAuthLink(scope) {
        return `https://id.twitch.tv/oauth2/authorize?client_id=${encodeURIComponent(config.twitch.client_id)}&redirect_uri=${encodeURIComponent(config.express.host + "auth")}&response_type=code&scope=${encodeURIComponent(scope.join(" "))}`;
    }

    /**
     * Requests a user directly from the Twitch Helix API
     * This method should NEVER be used externally as it can take a substantial amount of time to request and WILL overwrite other data.
     * @param {string} id 
     * @returns {Promise<TwitchUser>}
     */
    getUserByIdByForce(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let helixUser = await api.users.getUserByIdBatched(id);

                if (helixUser) {
                    const user = await TwitchUser.findOneAndUpdate(
                        {
                            _id: helixUser.id,
                        },
                        {
                            _id: helixUser.id,
                            login: helixUser.name,
                            display_name: helixUser.displayName,
                            type: helixUser.type,
                            broadcaster_type: helixUser.broadcasterType,
                            description: helixUser.description,
                            profile_image_url: helixUser.profilePictureUrl,
                            offline_image_url: helixUser.offlinePlaceholderUrl,
                            created_at: helixUser.creationDate,
                        }, {
                            upsert: true,
                            new: true,
                        }
                    );
                    
                    resolve(user);
                } else {
                    reject("User not found!");
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Gets a user based on a Twitch user ID.
     * @param {string} id 
     * @param {boolean} bypassCache
     * @param {boolean} requestIfUnavailable
     * 
     * @returns {Promise<TwitchUser>}
     */
    getUserById(id, bypassCache = false, requestIfUnavailable = false) {
        return this.userCache.get(id, async (resolve, reject) => {
            const user = await TwitchUser.findById(id)
                    .populate("identity");
            if (user) {
                resolve(user);
            } else {
                if (requestIfUnavailable) {
                    this.getUserByIdByForce(id).then(resolve, reject);
                } else {
                    reject("User not found!");
                }
            }
        }, bypassCache);
    }

    /**
     * Requests a user directly from the Twitch Helix API
     * This method should NEVER be used externally as it can take a substantial amount of time to request and WILL overwrite other data.
     * @param {string} login 
     * @returns {Promise<TwitchUser>}
     */
    getUserByNameByForce(login) {
        return new Promise(async (resolve, reject) => {
            try {
                let helixUser = await api.users.getUserByNameBatched(login);

                if (helixUser) {
                    const user = await TwitchUser.findOneAndUpdate(
                        {
                            _id: helixUser.id,
                        },
                        {
                            _id: helixUser.id,
                            login: helixUser.name,
                            display_name: helixUser.displayName,
                            type: helixUser.type,
                            broadcaster_type: helixUser.broadcasterType,
                            description: helixUser.description,
                            profile_image_url: helixUser.profilePictureUrl,
                            offline_image_url: helixUser.offlinePlaceholderUrl,
                            created_at: helixUser.creationDate,
                        }, {
                            upsert: true,
                            new: true,
                        }
                    );
                    
                    resolve(user);
                } else {
                    reject("User not found!");
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Gets a user based on a Twitch name
     * @param {string} login
     * @param {boolean} requestIfUnavailable default false
     * @param {boolean} bypassCache default false
     * @returns {Promise<TwitchUser>}
     */
    getUserByName(login, requestIfUnavailable = false, bypassCache = false) {
        login = login.replace("#","").toLowerCase();
        return new Promise(async (resolve, reject) => {
            try {
                if (this.nameCache.hasOwnProperty(login)) {
                    try {
                        const user = await this.getUserById(this.nameCache[login], bypassCache, false);
                        resolve(user);
                        return;
                    } catch(e) {}
                }
                const user = await TwitchUser.findOne({login: login})
                    .populate("identity");
                if (user) {
                    this.nameCache[user.login] = user._id;
                    resolve(user);
                } else {
                    if (requestIfUnavailable) {
                        this.getUserByNameByForce(login).then(resolve, reject);
                    } else {
                        reject("User not found!");
                    }
                }
            } catch(e) {
                reject(e);
            }
        });
    }

}

module.exports = new Twitch();
