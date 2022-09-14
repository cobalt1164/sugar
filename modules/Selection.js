var exports = module.exports = {};
const Selection = obtain("Selection");
const timeout = 4e4;

exports.selections = {};

exports.create = function(message, options, chain, callback) {
    if (!Selection.selections.hasOwnProperty(message.guild.id)) return;
    const user = message.author.id, guild = message.guild.id
    if (Selection.getSelection(message)) delete Selection.selections[guild][user]
    const type = typeof options == "string" ? "freeform" : "selection"
    Selection.selections[guild][user] = {"type": type, "channel": message.channel.id, "chain": chain, "options": options, "callback" : callback, "timeout": (Date.now() + timeout)};
    if (type == "selection") {
        const t = [];
        t.push("Respond with the corresponding number to select an option\n")
        Object.keys(options).forEach(i => {
            t.push(`\`${parseInt(i) + 1}\` - ${options[i]}`);
        })
        t.push("\nYou can say `quit` at any time to cancel Selection selection")
        message.reply(t)
        return;
    }
    if (type == "freeform") {
        message.reply(`${options}\n\nYou can say \`quit\` at any time to cancel Selection selection`)
    }
};

exports.getSelection = function(message) {
    if (!Selection.selections.hasOwnProperty(message.guild.id)) return;
    const user = message.author.id, guild = message.guild.id
    if (Selection.selections[guild].hasOwnProperty(user)) return Selection.selections[guild][user]
    return false
}

Network.Emitter.addListener(Network.events.clientReady, client => {
    setInterval(() => {
        client.guilds.map(s => {
            if (Selection.selections.hasOwnProperty(s.id)) return
            const t = Selection.selections.array()
            if (t.length > 0) {
                Object.keys(t).forEach(i => {
                    if (Date.now() >= t[i][1].timeout) {
                        if (Date.now() - t[i][1].timeout < 10000) client.channels.get(t[i][1].channel).send(`<@${t[i][0]}>, \`❗\` | Your selection has timed out`)
                        delete Selection.selections[s.id][t[i][0]]
                    }
                })
            }
        })
    }, 3000);
});

Network.Emitter.addListener(Network.events.messageReceived, message => {
    if (!Selection.selections.hasOwnProperty(message.guild.id)) Selection.selections[message.guild.id] = {};
    const user = message.author.id, guild = message.guild.id
    if (!Selection.getSelection(message)) return;
    const t = Selection.getSelection(message);
    let text = message.content;
    if(message.createdTimestamp - (t.timeout - timeout) < 1800) return
    if (text == "quit") {delete Selection.selections[guild][user]; message.reply(`\`✔\` | Successfully exited the selection prompt`); return}

    if (t.type == "freeform") {
        t.callback(text)
        if (!t.chain) delete Selection.selections[guild][user];
    }

    if (t.type == "selection") {
        if (isNaN(text)) {message.reply(`\`❗\` | Invalid selection. You can say \`quit\` at any time to cancel Selection selection`); return}
        text == 0 ? text = 1 : text;
        if (Math.abs(text) > t.options.length) {message.reply(`\`❗\` | Invalid selection. You can say \`quit\` at any time to cancel Selection selection`); return}
        t.callback(parseInt(text) - 1)
        if (!t.chain) delete Selection.selections[guild][user]
        return;
    }
});
