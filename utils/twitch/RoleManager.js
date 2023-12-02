const TwitchRole = require("../schemas/TwitchRole");
const TwitchUserRole = require("../schemas/TwitchUserRole");

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
                    const customRole = await TwitchRole.findOne({
                            channel: channelId,
                            type: role.type,
                        });
                    if (customRole) {
                        roles.push(customRole);
                    } else {
                        let data = role;
                        data.channel = channelId;
                        const newRole = await TwitchRole.create(data);
                        roles.push(newRole);
                        if (data.type === "broadcaster") {
                            await TwitchUserRole.create({
                                channel: channelId,
                                user: channelId,
                                role: newRole._id,
                            });
                        }
                    }
                }
    
                roles = [
                    ...roles,
                    ...(await TwitchRole.find({
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
                if (role.channel?._id) {
                    delete this.channelRoleCache[role.channel._id];
                } else {
                    delete this.channelRoleCache[role.channel];
                }
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
                
            if (this.channelRoleCache[channelId]) {
                delete this.channelRoleCache[channelId];
            }

            try {
                resolve(await TwitchRole.create(newData));
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

                const deleteUserRoles = await TwitchUserRole.deleteMany({role: role});
                const deleteRole = await role.deleteOne();
                
                if (this.channelRoleCache[channelId]) {
                    delete this.channelRoleCache[channelId];
                }

                resolve({
                    deletedUserRoles: deleteUserRoles.deletedCount,
                    deletedRoles: deleteRole.deletedCount,
                });
            } catch(err) {
                reject(err);
            }
        });
    }

}

module.exports = RoleManager;
