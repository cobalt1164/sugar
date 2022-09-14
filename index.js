// Sugar rewrite

/*TODO

*/

var exports = module.exports = {};
const Discord = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');
const sfetch = require('snekfetch');
const client = new Discord.Client();
const bold = chalk.bold;
const testChannelID = "344874595603447838";

Object.defineProperty(String.prototype, "alpha", {
    get: function() {
        return function() {
            return this.replace(/\W/g, "").toLowerCase();
        };
    },
    enumerable: false
});

Object.defineProperty(String.prototype, "pad", {
    get: function() {
        return function(len, next) {
            return `${this}${" ".repeat(len - (this.length + (next.length)))}${next}`;
        };
    },
    enumerable: false
});

Object.defineProperty(Object.prototype, "indexFromValue", {
    get: function() {
        return function(value) {
            for (const index in this) {
                if (this[index] == value) return index;
            }
        };
    },
    enumerable: false
});


Object.defineProperty(Object.prototype, "array", {
    get: function() {
        return function() {
            const t = [];
            Object.keys(this).forEach(_ => {
                t.push([_, this[_]]);
            })
            return t;
        };
    },
    enumerable: false
});

Object.defineProperty(Array.prototype, "joinFrom", {
    get: function() {
        return function(t) {
            return this.slice(t || 0).join(' ');
        };
    },
    enumerable: false
});

global.Network = require("./modules/Network.js");
global.obtain = Network.obtain;

const Credentials = obtain("Credentials");
const Database = obtain("Database");
const Command = obtain("Command");

client.on('ready', () => {
    obtain("List")(client);
    Network.Emitter.emit(Network.events.clientReady, client)
    let f = "";
    Object.keys(Network.Emitter.eventNames()).forEach(i => {
        const n = Network.Emitter.eventNames()[i];
        f += `${Network.Emitter.listenerCount(n)} ${Network.events.indexFromValue(n)} listeners initiated\n`
    });
    console.log(bold.green(`${client.user.username} has initiated!\n${f}`));
    client.user.setGame(`${Command.key}help for cmds`, "https://www.twitch.tv/xcobalt1164")

    sfetch.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
      .set('Authorization', Credentials(Database.sessionKey).dbl)
      .send({server_count: client.guilds.size})
      .then(console.log('updated discordbots.org server count'))
      .catch(e => console.warn('looks like discordbots.org isn\'t doing so well...'));

    process.on('uncaughtException', function(err) {
        if (!testChannelID) return;
        const testChannel = client.channels.get(testChannelID);
        if (testChannel) {
            testChannel.send(err.stack.replace(/David/g, "Cobalt"), {code: "js"})
        };
        console.error(err);
    })
});


client.on('guildCreate', s => {
    Database.addServer(s.id);
    console.log(bold.green(client.user.username.toLowerCase() + " has joined " + s.name));
})

client.on('message', message => {
    if (message.author.id != client.user.id && message.channel.type == "text" && !message.author.bot) {
        Network.Emitter.emit(Network.events.messageReceived, message);
    };
});


client.login(Credentials(Database.sessionKey).token);
