var exports = module.exports = {};
const Database = obtain("Database");
const Voice = obtain("Voice");
const ytdl = require("ytdl-core");

exports.addToQueue = function(guild, data) {
    if (!Database.serverData.has(`${guild}.queueData`)) return;
    const queue = Database.serverData.get(`${guild}.queueData`);
    queue.push(data);
    Database.serverData.set(`${guild}.queueData`, queue);
};

exports.next = function(guild, client) {
    if (!Database.serverData.has(`${guild}.queueData`)) return;
    const queue = Database.serverData.get(`${guild}.queueData`);
    const con = client.voiceConnections.get(guild);
    if (!con.playStream) return;
    const t = Database.serverData.get(`${guild}.musicChannel`);
    if (queue.length == 0) {
        if (!client.channels.get(t)) return;
        client.channels.get(t).send("`✔` | The queue has finished playing");
        con.disconnect();
        return;
    };
    const nextSong = queue[0];
    ytdl.getInfo(nextSong.link, (err, info) => {
        if (!client.channels.get(t)) return;
        client.channels.get(t).send(`\`♬\` | Now playing: \`${info.title}\``);
    });
    const dispatcher = con.playStream(ytdl(nextSong.link, {filter: "audioonly"}));
    dispatcher.addListener("end", function(){
        const uQ = Database.serverData.get(`${guild}.queueData`);
        const e = uQ.shift();
        Database.serverData.set(`${guild}.queueData`, uQ);
        Voice.next(guild, client)
    });
};

exports.linkType = function(str) {
    return str.match(/(?:^.*youtu\.be\/|^.*youtube\.com\/watch\?v\=)(.{11})/) ? 1 : str.match(/(?:^.*soundcloud\.com\/)/) ? 2 : false
};

exports.joinVoiceChannel = function(message) {
    if (!message.member.voiceChannel) {message.reply("`❗` | You are not in a voice channel."); return false};
    if (!message.member.voiceChannel.joinable) {message.reply("`❗` | I do not have permissions to join your voice channel"); return false};
    message.member.voiceChannel.join().catch(console.error);
};
