var exports = module.exports = {};
const User = obtain("User");
const Selection = obtain("Selection");
const Command = obtain("Command");
const Util = obtain("Util");
const Database = obtain("Database");

exports.cmds = {}
exports.key = 's\\'
exports.color = 12280218
exports.GlobalCooldown = 3

exports.add = function(aliases, description, args, rank, callback) {
    Command.cmds[aliases[0]] = {
        "aliases": aliases,
        "description": description,
        "args": args,
        "rank": rank,
        "callback": callback
    };
}

exports.fetch = function(alias) {
    for (const command in Command.cmds) {
        const cmd = Command.cmds[command]
        for (i = 0; i < cmd.aliases.length; i++) {
            if (cmd.aliases[i] == alias) {
                return cmd
            }
        }
    }
    return false;
}

Network.Emitter.addListener(Network.events.messageReceived, function (message) {
    if (message.channel.type !== "text") return;
    let text = message.content
    const run = function(cmd, ret, arg) {
        if (!Database.getUser(message.author.id, message.guild.id)) Database.newUser(message)
        if (Selection.getSelection(message)) return
        if (User.permissions(message.author.id, message.guild.id) >= cmd.rank) {
            if (cmd.args != false && !arg) {
                message.reply("`❗` | No arguments found. You are required to provide the `" + cmd.args + "` parameter.");
                return;
            };
            if (Date.now() <= Database.getUser(message.author.id, message.guild.id).cd && message.author.id != 155071784805203968) {
                message.reply(`\`❗\` | Please wait \`${Util.DecimalAdjust("round", (Database.getUser(message.author.id, message.guild.id).cd - Date.now()) / 1000, -1)}\` second(s) before using another command`)
                return;
            }
            Database.serverData.set(`${message.guild.id}.userData.${message.author.id}.cd`, Date.now() + (Network.obtain("Command").GlobalCooldown * 1000))
            try {
                cmd.callback(message, ret)
            } catch (err) {
                console.log(`[${cmd.aliases.join(", ")}]: ${err.stack}`)
                message.reply(err.stack.replace(/David/g, "Cobalt"), {
                    code: "js"
                })
            };
            return;
        };
        if (User.permissions(message.author.id, message.guild.id) < 1) {message.reply("`❗` | You are blacklisted from using commands");return;}
        message.reply("`❗` | You do not have the required permission level to run that command.")
        return;
    }

    if (text.substring(0, Command.key.length) == Command.key) {
        text = text.substring(Command.key.length)
        if (text.search(" ") < 1 && Command.fetch(text) != false) {
            run(Command.fetch(text), [], false);
        };

        const alias = text.substring(0, text.search(" "));
        if (Command.fetch(alias) != false) {
            const args = text.substring(alias.length + 1).split(" ");
            run(Command.fetch(alias), args, true)
        }
    }
});
