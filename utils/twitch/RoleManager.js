const Role = require("../schemas/Role");
const UserRole = require("../schemas/UserRole");

const DEFAULT_ROLES = [
    {
        type: "broadcaster",
        weight: 1000,
        name: "Broadcaster",
        description: "The one and only Broadcaster! Users may NOT be added to this group.",
    },
    {
        type: "editor",
        weight: 500,
        name: "Editor",
        description: "Twitch Editors, automatically updated from Twitch",
    },
    {
        type: "moderator",
        weight: 250,
        name: "Moderator",
        description: "Twitch Moderators, automatically updated from Twitch",
    },
    {
        type: "vip",
        weight: 100,
        name: "VIP",
        description: "Twitch VIPs, automatically updated from Twitch",
    },
    {
        type: "subscriber",
        weight: 50,
        name: "Subscriber",
        description: "Twitch Subscriber, automatically updated from Twitch",
    },
];

class RoleManager {

    channelRoleCache = {};
    userRoleCache = {};

    /**
     * Retrieves roles for a specified Channel
     * @param {string} channelId
     * @returns {Promise<{_id:any,channel:object,type:string,name:string,weight:number,description:string}[]>}
     */
    getChannelRoles(channelId) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.channelRoleCache.hasOwnProperty(channelId)) {
                    return resolve(this.channelRoleCache[channelId]);
                }
    
                let roles = [];
    
                for (let i = 0; i < DEFAULT_ROLES.length; i++) {
                    const role = DEFAULT_ROLES[i];
                    const customRole = await Role.findOne({
                            channel: channelId,
                            type: role.type,
                        });
                    if (customRole) {
                        roles.push(customRole);
                    } else {
                        let data = role;
                        data.channel = channelId;
                        const newRole = await Role.create(data);
                        roles.push(newRole);
                        if (data.type === "broadcaster") {
                            await UserRole.create({
                                channel: channelId,
                                user: channelId,
                                role: newRole._id,
                            });
                        }
                    }
                }
    
                roles = [
                    ...roles,
                    ...(await Role.find({
                        channel: channelId,
                        type: "custom",
                    })),
                ];

                roles.sort((a,b) => b.weight - a.weight);
    
                this.channelRoleCache[channelId] = roles;
                resolve(roles);
            } catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Edits a Role with the specified data
     * @param {object} role
     * @param {{name:string?,description:string?,weight:number|string|null}} data 
     * @returns {Promise<{_id:any,channel:object,type:string,name:string,weight:number,description:string}>} The edited role
     */
    editRole(role, data) {
        return new Promise(async (resolve, reject) => {
            let newData = {};
    
            if (data?.name) {
                if (typeof(data.name) !== "string") {
                    return reject("Name must be of type 'string'");
                }
                if (data.name.length < 2 || data.name.length > 50) {
                    return reject("Name must be between 2 and 50 characters");
                }
                newData.name = data.name;
            }
            if (data?.description) {
                if (typeof(data.description) !== "string") {
                    return reject("Description must be of type 'string'");
                }
                if (data.description.length > 200) {
                    return reject("Description must be less than 200 characters");
                }
                newData.description = data.description;
            }
            if (data.hasOwnProperty("weight")) {
                if (typeof(data.weight) === "string") {
                    data.weight = Number(data.weight);
                }
                if (typeof(data.weight) !== "number" || isNaN(data.weight)) {
                    return reject("Weight must be of type 'number'");
                }
                if (data.weight < 0 || data.weight > 10000) {
                    return reject("Weight must be between 0 and 10000")
                }
                newData.weight = Math.floor(data.weight);
            }

            if (newData.name) role.name = newData.name;
            if (newData.description) role.description = newData.description;
            if (newData.weight) role.weight = newData.weight;

            try {
                await role.save();

                const channelId = role?.channel?._id ? role.channel._id : role.channel;
                    
                delete this.channelRoleCache[channelId];
                delete this.userRoleCache[channelId];

                resolve(role);
            } catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Creates a new Role with the given data
     * @param {{name:string?,description:string?,weight:number|string|null,channel:string}} data 
     * @returns {Promise<{_id:any,channel:object,type:string,name:string,weight:number,description:string}>}
     */
    createRole(data) {
        return new Promise(async (resolve, reject) => {
            let newData = {};
    
            if (data?.name) {
                if (typeof(data.name) !== "string") {
                    return reject("Name must be of type 'string'");
                }
                if (data.name.length < 2 || data.name.length > 50) {
                    return reject("Name must be between 2 and 50 characters");
                }
                newData.name = data.name;
            }
            if (data?.description) {
                if (typeof(data.description) !== "string") {
                    return reject("Description must be of type 'string'");
                }
                if (data.description.length > 200) {
                    return reject("Description must be less than 200 characters");
                }
                newData.description = data.description;
            }
            if (data.hasOwnProperty("weight")) {
                if (typeof(data.weight) === "string") {
                    data.weight = Number(data.weight);
                }
                if (typeof(data.weight) !== "number" || isNaN(data.weight)) {
                    return reject("Weight must be of type 'number'");
                }
                if (data.weight < 0 || data.weight > 10000) {
                    return reject("Weight must be between 0 and 10000")
                }
                newData.weight = Math.floor(data.weight);
            }
            if (!data?.channel) {
                return reject("Target channel is missing from request!");
            }

            newData.channel = data.channel;
            newData.type = "custom";

            const channelId = data?.channel?._id ? data.channel._id : data.channel;
                
            delete this.channelRoleCache[channelId];
            delete this.userRoleCache[channelId];

            try {
                resolve(await Role.create(newData));
            } catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Deletes a role
     * @param {object} role 
     * @returns {Promise<{deletedUserRoles:number,deletedUsers:number}>}
     */
    deleteRole(role) {
        return new Promise(async (resolve, reject) => {
            if (role.type !== "custom") {
                return reject("You may only delete custom roles");
            }
            try {
                const channelId = role?.channel?._id ? role.channel.id : role.channel;

                const deleteUserRoles = await UserRole.deleteMany({role: role});
                const deleteRole = await role.deleteOne();
                
                delete this.channelRoleCache[channelId];
                delete this.userRoleCache[channelId];

                resolve({
                    deletedUserRoles: deleteUserRoles.deletedCount,
                    deletedRoles: deleteRole.deletedCount,
                });
            } catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Gets all channel user roles for a specified channel
     * @param {string} channelId 
     * @returns {Promise<{user: object,roles:object[],maxWeight:number}[]>}
     */
    getChannelUsers(channelId) {
        return new Promise(async (resolve, reject) => {
            if (this.userRoleCache.hasOwnProperty(channelId)) {
                return resolve(this.userRoleCache[channelId]);
            }

            let result = [];

            const userRoles = await UserRole.find({channel: channelId, last_seen: null})
                .populate(["user","role"]);

            // Construct initial user/role table
            for (let i = 0; i < userRoles.length; i++) {
                const userRole = userRoles[i];
                let storedUser = result.find(x => x.user._id === userRole.user._id);
                if (storedUser) {
                    storedUser.roles.push(userRole.role);
                    storedUser.maxWeight = Math.max(storedUser.maxWeight, userRole.role.weight);
                } else {
                    result.push({
                        user: userRole.user,
                        roles: [userRole.role],
                        maxWeight: userRole.role.weight,
                    });
                }
            }

            // Sort user roles by weight
            for (let i = 0; i < result.length; i++) {
                result[i].roles.sort((a, b) => b.weight - a.weight);
            }

            // Sort users by display name then weight
            result.sort((a, b) => a.user.display_name - b.user.display_name);
            result.sort((a, b) => b.maxWeight - a.maxWeight);

            this.userRoleCache[channelId] = result;

            resolve(result);
        });
    }

    /**
     * Adds a role to a user
     * @param {object} role 
     * @param {object|string} user 
     * @returns {Promise<object>}
     */
    addRoleToUser(role, user) {
        return new Promise(async (resolve, reject) => {
            try {
                if (role.type !== "custom") {
                    return reject("Only custom roles may be added to users");
                }

                const userRole = await UserRole.findOneAndUpdate({
                    channel: role.channel,
                    role,
                    user,
                }, {
                    channel: role.channel,
                    role,
                    user,
                    last_seen: null,
                }, {
                    upsert: true,
                    new: true,
                })
                .populate(["role", "user", "channel"]);

                const channelId = role?.channel?._id ? role.channel.id : role.channel;
                delete this.userRoleCache[channelId];

                resolve(userRole);
            } catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Removes a role from a user
     * @param {object} role 
     * @param {object|string} user 
     * @returns {Promise<void>}
     */
    removeRoleFromUser(role, user) {
        return new Promise(async (resolve, reject) => {
            try {
                if (role.type !== "custom") {
                    return reject("Only custom roles may be removed from users");
                }

                await UserRole.findOneAndDelete({
                    channel: role.channel,
                    role,
                    user,
                });

                const channelId = role?.channel?._id ? role.channel.id : role.channel;
                delete this.userRoleCache[channelId];

                resolve();
            } catch(err) {
                reject(err);
            }
        });
    }

}

module.exports = RoleManager;
