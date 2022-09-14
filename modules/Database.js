var exports = module.exports = {};
const Storage = require('configstore');
const Database = obtain("Database");
const defaultGuild = {userData:{}, coinFlips:{}, queueData:[], musicChannel: 0};
const defaultUser = {cd: 0};

exports.serverData = new Storage("W_SERVERDATA_R8");
exports.sessionKey = require("crypto").randomBytes(16).toString('hex').toLowerCase();

exports.newUser = function(message) {
    if (Database.serverData.has(message.guild.id)) Database.serverData.set(`${message.guild.id}.userData.${message.author.id}`, defaultUser);
};

exports.getUser = function(user, guild) {
    if (Database.serverData.has(guild) && Database.serverData.has(`${guild}.userData.${user}`)) {
        return Database.serverData.get(`${guild}.userData.${user}`);
    };
    return false;
};

exports.addServer = function(id) {
    if (!Database.serverData.has(id)) {
        Database.serverData.set(id, defaultGuild);
    };
};

Network.Emitter.addListener(Network.events.messageReceived, function(message) {
    const user = message.author.id, guild = message.guild.id
    if (!Database.serverData.has(guild)) return;
    Object.keys(defaultGuild).forEach(k => {
        if (!Database.serverData.has(`${guild}.${k}`)) Database.serverData.set(`${guild}.${k}`, defaultGuild[k]);
    });
    if (!Database.serverData.has(`${guild}.userData.${user}`)) return;
    Object.keys(defaultUser).forEach(k => {
        if (!Database.serverData.has(`${guild}.userData.${user}.${k}`)) Database.serverData.set(`${guild}.userData.${user}.${k}`, defaultUser[k]);
    });
});

Network.Emitter.addListener(Network.events.clientReady, function(client) {
    client.guilds.map(s => {
        Database.addServer(s.id);
    });
});
