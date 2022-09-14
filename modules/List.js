var exports = module.exports = {};
const Discord = require("discord.js");
const WordValidate = require("check-word")("en");
const crypto = require("crypto");
const ytdl = require("ytdl-core");

const Coinflip = obtain("Coinflip");
const Command = obtain("Command");
const Credentials = obtain("Credentials");
const Database = obtain("Database");
const Finances = obtain("Finances");
const Selection = obtain("Selection");
const User = obtain("User");
const Util = obtain("Util");
const Voice = obtain("Voice");

module.exports = function(client) {

// rank -> alphanumeric

Command.add(['eval', 'exe'], "execute a script", '<code>', 3, (message, args) => {
    const code = args.joinFrom();
    try {
        message.reply(eval(code), {
            code: "js"
        });
    } catch (err) {
        message.reply(err.stack.replace(/David/g, "Cobalt"), {
            code: "js"
        });
    };
});

Command.add(['h'], "for me", "<int [...]>", 3, (message, args) => {
    const t = [];
    let de = false;
    const inv = 0;
    for (let i = 0; i < Object.keys(args).length; i++) {
        if (isNaN(args[i])) {de = true; inv++; continue}
        t.push((args[i]/16)*1.2);
    };
    de == false ? 0 : message.reply(`\`❗\` | ${inv} invalid integer(s) detected`)
    t.length > 0 ? message.reply(t, {code: "js"}) : 0
});

Command.add(['unscramble'], "shows all permutations of the string that are english words", "<string>", 3, (message, args) => {
    if (args[0].length > 7) {message.reply("`❗` | Maximum length is seven characters"); return}
    // TODO: message.channel.send(`\`✔\` | Calculating permutations... ()`)
    const t = Util.permutation(args[0].split('')).filter(s => {return WordValidate.check(s.join(''))});
    if (t.length < 1) {message.reply("`❗` | No valid permutations found"); return}
    Object.keys(t).forEach(i => {t[i] = t[i].join('')})
    message.reply(`\`✔\` | Valid words that match \`${args[0]}\`\n\`\`\`xl\n${t.join(", ")}\`\`\``)
});

Command.add(['anagram', 'ana'], "checks if 2 words are anagrams", "<word1 | word2>", 1, (message, args) => {
    if (args.join(" ").indexOf("|") !== -1) {
        const words = args.join(" ").split("|")
        if (words.length > 2) {message.reply("`❗` | You can only check 2 words"); return}
        if (words[1].length < 1) {message.reply("`❗` | Invalid second word"); return}
        const word1 = words[0].alpha().split(""), word2 = words[1].alpha().split("");
        const alphanumeric = function(a, b) {return a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0)};
        word1.sort(alphanumeric);
        word2.sort(alphanumeric);
        if (word1.join() == word2.join()) {
            message.reply(`\`✔\` | \`${words[0]}\` and \`${words[1]}\` are anagrams`);
            return;
        };
        message.reply(`\`❗\` | \`${words[0]}\` and \`${words[1]}\` are not anagrams`);
        return;
    };
    message.reply("`❗` | Invalid second word")
});

Command.add(['arank', 'adminrank'], "shows your permission level", false, 1, (message, args) => {
    message.reply(`\`✔\` | Your permission level is \`${User.permissions(message.author.id, message.guild.id)}\``)
    //TODO: other people
});

/*Command.add(['bear'], "render a bear in any colour", "<red, green, blue>", 1, (message, args) => {
    if (args.length < 3 || isNaN(args.join("").replace(/-/gi, ""))) {message.reply("`❗` | Invalid RGB"); return}
    if (!message.guild.members.get(client.user.id).hasPermission("ATTACH_FILES")) {message.reply("`❗` | I don't have the permissions to attach files"); return}
    message.reply("`✔` | Rendering...").then(m => {
        Object.keys(args).forEach(i => {args[i] = Math.abs(args[i])})
        Render.rgb("./images/bear.png", ...args, ()=>{
            message.channel.send({file : "./images/bear.png"});
            m.delete()
        });
    });
});*/

Command.add(['choose', 'random'], "choose randomly between multiple options", "<option1 | option2 | ... >", 1, (message, args) => {
    if (args.join(" ").indexOf("|") !== -1) {
        const options = args.join(" ").split("|");
        if (options[1].length < 1) {message.reply("`❗` | You need more than one option"); return}
        const option = options[Math.floor(Math.random()*options.length)]
        message.reply(`\`✔\` | Chose \`${option}\``);
        return;
    };
    message.reply("`❗` | You need more than one option");
});

Command.add(['finance', 'f'], "actions: balance, gamble, lead, coinflip, pay", "<action>", 1, (message, args) => {
    if (!Database.serverData.has(message.guild.id)) {message.reply("No server data"); return}

    if (args[0] === "bal" || args[0] === "balance") {
        const pos = Finances.position(message.author.id, message.guild.id)
        const reg = Object.keys(Database.serverData.get(`${message.guild.id}.userData`)).length.toLocaleString()
        if (args[1] && message.mentions.members.first()) {
            const thisUser = message.mentions.members.first()
            if (!Finances.getUser(thisUser.id, message.guild.id)) { message.reply("`❗` | That user doesn't have a bank account"); return;}
            const thisPos = Finances.position(thisUser.id, message.guild.id).toLocaleString();
            message.reply(`\`💰\` | ${thisUser}'s balance: \`$${Finances.getUser(thisUser.id, message.guild.id).balance.toLocaleString()}\` (ranked #${thisPos}/${reg})`);
            return;
        };
        if (!Finances.getUser(message.author.id, message.guild.id)) {
            Finances.newUser(message)
            message.reply(`\`✔\` | Successfully created a new bank account. Your balance is $${Finances.getUser(message.author.id, message.guild.id).balance.toLocaleString()}`);
            return;
        };
        message.reply(`\`💰\` Balance: \`$${Finances.getUser(message.author.id, message.guild.id).balance.toLocaleString()}\` (ranked #${pos.toLocaleString()}/${reg})`)

        return;
    };

    if (args[0] === "gamble" || args[0] === "bet") {
        if (message.guild.id === "167423382697148416" && message.channel.id !== "229714247213514752") {message.reply(`\`❗\` | This command can only be used in <#229714247213514752>`); return}
        if (!Finances.getUser(message.author.id, message.guild.id)) {message.reply(`\`❗\` | You do not have a bank account. Create one by saying \`${Command.key}f bal\``); return;}
        if (args.length < 3) {message.reply("`❗` | No arguments found. You are required to provide the `<amount, multiplier>` parameters."); return}
        if (isNaN(args[1]) || isNaN(args[2])) {message.reply("`❗` | Invalid integer detected"); return}
        const amount = Math.abs(args[1]);
        const multiplier = Util.DecimalAdjust("round", Math.abs(args[2]), -3);
        const mod = (amount / 100000) * 15
        const t = ((1 / multiplier) * 100) - (mod > 15 ? 15 : mod)
        const b = Finances.getUser(message.author.id, message.guild.id).balance
        if (multiplier < 1.5 || multiplier > 250) {message.reply(`\`❗\` | Your multiplier \`(x${multiplier})\` is out of boundaries \`(x1.5 - x250)\``); return}
        if (amount > Util.DecimalAdjust("round", b, -2)) {message.reply(`\`❗\` | Insufficient balance. You need \`$${(amount-b).toLocaleString()}\` more to complete that transaction.`); return}
        if (Util.CryptoRandom() < t) {
            const award = Util.DecimalAdjust("round", (amount*multiplier)-amount, -2)
            Finances.addBalance(message.author.id, message.guild.id, award);
            message.reply(`\`✔\` | Successfully gambled\n\`💰\` | You won \`$${award.toLocaleString()}\` at a ${Util.DecimalAdjust("round", t, -2)}% winning rate (x${multiplier} multiplier)\n\`🏦\` | New balance: \`$${Util.DecimalAdjust("round", Finances.getUser(message.author.id, message.guild.id).balance, -2).toLocaleString()}\``);
            return;
        };
        Finances.addBalance(message.author.id, message.guild.id, -Util.DecimalAdjust("round", amount, -2))
        message.reply(`\`❗\` | Gamble failed\n\`💣\` | You lost \`$${amount.toLocaleString()}\` at a ${Util.DecimalAdjust("round", 100-t, -2)}% losing rate (x${multiplier} multiplier)\n\`🏦\` | New balance: \`$${Finances.getUser(message.author.id, message.guild.id).balance.toLocaleString()}\``);
        return;
    };

    if (args[0] === "lead" || args[0] === "top") {
        const all = Database.serverData.get(`${message.guild.id}.userData`).array().filter(t => {return Finances.getUser(t[0], message.guild.id)});
        if (all.length === 0) {message.reply(`\`❗\` | There isn't anyone on the leaderboards`); return}
        all.sort((a, b) => {return b[1].finance.balance - a[1].finance.balance})
        let format = "", format2 = "", format3 = "";
        const t = new Discord.RichEmbed()
        .setColor(Command.color)
        .setAuthor(`Money leaderboards for ${message.guild.name}`)
        .setDescription("\u200B")
        for (let i = 0; i < (Object.keys(all).length > 10 ? 10 : Object.keys(all).length); i++) {
            format += `${i == 0 ? "👑" : "" + (i + 1)}\n`
            format2 += `<@${all[i][0]}>\n`;
            format3 += `$${Util.DecimalAdjust("round", all[i][1].finance.balance, -2).toLocaleString()}\n`;
        };
        t.addField("Position", format, true)
        .addField("User", format2, true)
        .addField("Money", format3, true)
        message.channel.send({embed: t})
        return;
    };

    if (args[0] === "coinflip" || args[0] === "coin") {
        if (!Finances.getUser(message.author.id, message.guild.id)) {message.reply(`\`❗\` | You do not have a bank account. Create one by saying \`${Command.key}f bal\``); return;}
        if (args.length < 2) {message.reply("`❗` | Invalid action.\nAvailable actions: \`create, play, list, cancel\`"); return}
        const action = args[1];
        if (action === "create") {
            if (args.length < 4) {message.reply("`❗` | No arguments found. You must provide the \`<amount, [heads, tails]>\` parameters."); return}
            if (isNaN(args[2])) {message.reply("`❗` | Invalid integer detected"); return}
            if (Coinflip.findUserMatch(message.author.id, message.guild.id)) {message.reply(`\`❗\` | You are already hosting a coinflip match. You can cancel it at any time by using \`${Command.key}f coin cancel\``); return}
            (args[3].alpha() == "heads" || args[3].alpha() == "tails") ? 0 : args[3] = (Util.CryptoRandom() < 50 ? "heads" : "tails")
            const side = args[3];
            const amount = Math.abs(args[2]);
            const id = crypto.randomBytes(3).toString('hex').toLowerCase();
            const bal = Finances.getUser(message.author.id, message.guild.id).balance
            if (Object.keys(Database.serverData.get(`${message.guild.id}.coinFlips`)).length >= 20) {message.reply(`\`❗\` | The maximum number of coinflip lobbies has been reached \`(20)\``);return}
            if (amount > Util.DecimalAdjust("round", bal, -2)) {message.reply(`\`❗\` | Insufficient balance. You need \`$${(amount-bal).toLocaleString()}\` more to complete that transaction.`); return}
            Coinflip.newMatch(message.author.id, message.guild.id, amount, side, id)
            message.reply(`\`✔\` | Successfully created a coinflip match for \`$${amount.toLocaleString()}\` with ID \`${id}\` (you are ${side})`)
            return;
        };
        if (action === "list") {
            const all = Database.serverData.get(`${message.guild.id}.coinFlips`).array();
            if (all.length === 0) {message.reply(`\`❗\` | There aren't any coinflip matches right now`); return}
            all.sort((a, b) => {return b[1].stake - a[1].stake})
            let format = "";
            const t = new Discord.RichEmbed()
            .setColor(Command.color)
            .setAuthor(`List of coinflip matches in ${message.guild.name}`)
            for (let i = 0; i < Object.keys(all).length; i++) {
                format += `[<@${all[i][0]}>'s match] Stake: \`$${all[i][1].stake.toLocaleString()}\`, Their side: \`${all[i][1].side}\`, ID: \`${all[i][1].id}\`\n`
            }
            t.addField("\u200B", format)
            message.channel.send({embed: t});
            return;
        };
        if (action === "play" || action === "join") {
            if (args.length < 3) {message.reply("`❗` | No arguments found. You must provide the \`<ID>\` parameter."); return}
            const id = args[2];
            if (!Coinflip.findMatchById(message.guild.id, id)) {message.reply(`\`❗\` | Couldn't find a match with ID \`${id}\``); return}
            const t = Coinflip.findMatchById(message.guild.id, id);
            if (t[0] == message.author.id) {message.reply(`\`❗\` | You cannot join a match with yourself`); return}
            const u = Finances.getUser(message.author.id, message.guild.id);
            const o = Finances.getUser(t[0], message.guild.id);
            if (Coinflip.findUserMatch(message.author.id, message.guild.id)) {message.reply(`\`❗\` | You are already hosting a coinflip match. You can cancel it at any time by using \`${Command.key}f coin cancel\``); return}
            if (t[1].stake > Util.DecimalAdjust("round", u.balance, -2)) {message.reply(`\`❗\` | Insufficient balance. You need \`$${(t[1].stake-u.balance).toLocaleString()}\` more to complete that transaction.`); return}
            const out = (Util.CryptoRandom() < 50 ? "heads" : "tails");
            if (t[1].side == out) {
                Finances.addBalance(message.author.id, message.guild.id, -Util.DecimalAdjust("round", t[1].stake, -2))
                Finances.addBalance(t[0], message.guild.id, Util.DecimalAdjust("round", t[1].stake, -2)*2)
                const newu = Finances.getUser(message.author.id, message.guild.id)
                const newo = Finances.getUser(t[0], message.guild.id)
                message.reply(`\`❗\` | Flipped \`${out}\` (loss)\n\`💣\` | You lost \`$${Util.DecimalAdjust("round", t[1].stake, -2).toLocaleString()}\` against <@${t[0]}>\n\`🏦\` | New balance: \`$${newu.balance.toLocaleString()}\`\n\`🏦\` | <@${t[0]}>'s balance: \`$${newo.balance.toLocaleString()}\``)
                Coinflip.deleteMatch(t[0], message.guild.id);
                return;
            };
            Finances.addBalance(message.author.id, message.guild.id, Util.DecimalAdjust("round", t[1].stake, -2))
            const newu = Finances.getUser(message.author.id, message.guild.id)
            const newo = Finances.getUser(t[0], message.guild.id)
            message.reply(`\`✔\` | Flipped \`${out}\` (win)\n\`💰\` | You won \`$${Util.DecimalAdjust("round", t[1].stake, -2).toLocaleString()}\` against <@${t[0]}>\n\`🏦\` | New balance: \`$${newu.balance.toLocaleString()}\`\n\`🏦\` | <@${t[0]}>'s balance: \`$${newo.balance.toLocaleString()}\``)
            Coinflip.deleteMatch(t[0], message.guild.id);
            return;
        };
        if (action === "cancel") {
            if (!Coinflip.findUserMatch(message.author.id, message.guild.id)) {message.reply(`\`❗\` | You aren't hosting a coinflip match`); return}
            Finances.addBalance(message.author.id, message.guild.id, Coinflip.findUserMatch(message.author.id, message.guild.id).stake)
            Coinflip.deleteMatch(message.author.id, message.guild.id);
            message.reply(`\`✔\` | Successfully canceled your match`)
            return;
        };
    };

    message.reply("`❗` | Invalid action.\nAvailable actions: `balance, gamble, lead, coinflip, pay`")
});

Command.add(["music", "m"], "command for music actions\nactions: add, play, list", "<action>", 1, (message, args) => {
    if (!Database.serverData.has(`${message.guild.id}.queueData`)) return;
    if (args[0] === "add") {
        if (args.length < 2) {message.reply("`❗` | No arguments found. You must provide the \`<link>`\ parameter"); return};
        if (Database.serverData.get(`${message.guild.id}.queueData`).length == 15) {message.reply("`❗` | The queue has reached maximum capacity (15)"); return};
        if (Voice.linkType(args[1]) == false || Voice.linkType(args[1]) == "soundcloud") {message.reply("`❗` | Invalid link. Only youtube is supported"); return};
        const link = args[1].match(/(?:^.*youtu\.be\/|^.*youtube\.com\/watch\?v\=)(.{11})/g)[0];
        ytdl.getInfo(link, (err, info) => {
            if (!info) {message.reply("`❗` | Could not download that link. Try something else"); return}
            if (info.length_seconds > 60 * 60 * 6) {message.reply("`❗` | Maximum video length is 6 hours"); return}
            Voice.addToQueue(message.guild.id, {
                 "link": link,
                 "title": info.title,
                 "length": info.length_seconds
            });
            message.reply(`\`✔\` | Successfully added \`${info.title}\` to the queue`);
            return;
        });
        return;
    };
    if (args[0] === "queue" || args[0] === "list") {
        const queue = Database.serverData.get(`${message.guild.id}.queueData`);
        if (queue.length === 0) {message.reply(`\`❗\` | The queue is empty. Use ${Command.key}m add \`<link>\` to add something to the queue`); return}
        let f2 = "";
        const embed = new Discord.RichEmbed()
        .setColor(Command.color)
        .setAuthor(`Current music queue for ${message.guild.name}`)
        .setThumbnail("https://redalemeden.com/images/itunes/12-2-0.png")
        Object.keys(queue).forEach(i => {
            const ex = Util.FormatSeconds(queue[i].length)
            const sec = ex[3]
            const min = ex[2]
            const hr = ex[1]
            const time = `${hr == 0 ? "" : `0${hr}:`}${min == 0 ? "0:" : (min.toString().length == 2 ? `${min}:` : `0${min}:`)}${sec == 0 ? "00" : (sec.toString().length == 2 ? `${sec}` : `0${sec}`)}`
            f2 += `${parseInt(i) + 1}. \`${queue[i].title.length < 40 ? queue[i].title : queue[i].title.substring(0, 42) + "..."}\` (${time})\n`;
        });
        embed.addField("\u200B", f2, true);
        message.channel.send({embed: embed});
        return;
    };
    if (args[0] === "play" || args[0] === "start") {
        const queue = Database.serverData.get(`${message.guild.id}.queueData`);
        if (client.voiceConnections.get(message.guild.id)) {message.reply(`\`❗\` | The queue is already playing`); return}
        if (queue.length === 0) {message.reply(`\`❗\` | The queue is empty. Use ${Command.key}m add \`<link>\` to add something to the queue`); return}
        const check = Voice.joinVoiceChannel(message);
        if (check === false) return;
        Database.serverData.set(`${message.guild.id}.musicChannel`, message.channel.id)
        const con = client.voiceConnections.get(message.guild.id);
        if (!con) {console.error("no voiceconnection"); return;};
        Voice.next(message.guild.id, client)
        return;
    };
    message.reply("`❗` | Invalid action.\nAvailable actions: `add, play, list`");
});

Command.add(['ping'], "response time", false, 1, (message, args) => {
    message.channel.send("`✔` | `0` ms").then(m => {
        m.edit(`\`✔\` | \`${m.createdTimestamp-message.createdTimestamp}\` ms`);
    });
});

Command.add(['roll', 'dice'], "roll a dice", false, 1, (message, args) => {
    const max = message.content.split(" ");

    if (max[1] && !isNaN(max[1]) && Math.abs(max[1]) < 1e15) {
        const rand = Math.floor(Util.Arandom(1, Math.abs(max[1])));
        message.reply(`\`🎲\` | Rolled \`${rand.toLocaleString()}\``);
        return;
    };

    if (max[1] && !isNaN(max[1]) && Math.abs(max[1]) > 1e15) {
        const rand = Math.floor(Util.Arandom(1, 1e15));
        message.reply(`\`🎲\` | Rolled \`${rand.toLocaleString()}\``);
        return;
    };

    const rand = Math.floor(Util.Arandom(1, 101));
    message.reply(`\`🎲\` | Rolled \`${rand.toLocaleString()}\``);
});

Command.add(['help', 'cmds'], "view the list of commands", false, 1, (message, args) => {
    const content = message.content.split(" ");
    if (content[1] && Command.fetch(content[1]) != false) {
        const cmd = Command.fetch(content[1]);
        const send = new Discord.RichEmbed()
        .setColor(Command.color)
        .setAuthor(`\nInformation about ${content[1] != cmd.aliases[0] ? cmd.aliases[0] + " (" + content[1] + ") " : content[1]}\n`)
        .setDescription(cmd.description)
        .addField("Aliases", `\`${cmd.aliases}\``)
        .addField("Arguments", `\`${cmd.args == false ? "none" : cmd.args}\``)
        .addField("Permission level", `\`${cmd.rank}\``)
        message.channel.send({embed: send});
        return;
    }
    const list = [];
    Object.keys(Command.cmds).forEach(name => {
        if (Command.cmds[name].rank === 3) return;
        list.push("`" + name + "`");
    })
    message.author.send(`Use \`${Command.key}help <name>\` to get more information on a command\n\nCurrent list of commands: ${list}`);
});

Command.add(['reverse', 'rev'], "reverse a string", "<string>", 1, (message, args) => {
    const str = args.join(" ");
    const check = str.alpha();
    if (check.split("").reverse().join("") == check) {
        message.reply("`❗` | That's a palindrome");
        return;
    }
    message.reply(`\`✔\` | \`${str.split('').reverse().join('')}\``);
});

Command.add(['status', 'stats'], "shows the status/information of the client", false, 1, (message, args) => {
    const time = Util.FormatSeconds(process.uptime());
    const t = new Discord.RichEmbed()
    .setColor(Command.color)
    .setAuthor(`${client.user.username}'s status`)
    .setDescription("\u200B")
    .setThumbnail(client.user.avatarURL)
    .addField("Servers", `\`${client.guilds.size}\``)
    .addField("Users", `\`${client.users.size}\``)
    .addField("Uptime", `\`${time[0]} days, ${time[1]} hours, ${time[2]} minutes, ${time[3]} seconds\``)
    .addField("Invite", `https://discordapp.com/oauth2/authorize?permissions=8&scope=bot&client_id=313901358883536920`)

    message.channel.send({embed: t});
});

};
