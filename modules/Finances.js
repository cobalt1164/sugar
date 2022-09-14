var exports = module.exports = {};
const Database = obtain("Database");
const Finances = obtain("Finances");
const Util = obtain("Util");
const defaultFinance = {balance: 0, next: 0, nextDonate: 0};


exports.addBalance = function(user, guild, set) {
    if(!Finances.getUser(user, guild)) return false;
    Database.serverData.set(`${guild}.userData.${user}.finance.balance`,
    Database.serverData.get(`${guild}.userData.${user}.finance.balance`) + parseInt(set))
};

exports.newUser = function(message) {
    if (Database.serverData.has(message.guild.id) && Database.getUser(message.author.id, message.guild.id)) {
        Database.serverData.set(`${message.guild.id}.userData.${message.author.id}.finance`, defaultFinance)
    };
};

exports.getUser = function(user, guild) {
    if (Database.serverData.has(guild) && Database.serverData.has(`${guild}.userData.${user}.finance`)) {
        return Database.serverData.get(`${guild}.userData.${user}.finance`)
    };
    return false;
};

exports.position = function(user, guild) {
    if (!Finances.getUser(user, guild)) return false;
    const all = Database.serverData.get(`${guild}.userData`).array().filter(t => {return Finances.getUser(t[0], guild)});
    all.sort((a, b) => {return b[1].finance.balance - a[1].finance.balance});

    for (let i = 0; i < Object.keys(all).length; i++) {
        if (all[i][0] == user) return i + 1;
    }
};

Network.Emitter.addListener(Network.events.messageReceived, function (message) {
    const user = message.author.id, guild = message.guild.id
    if (!Database.serverData.has(guild)) return;
    if (!Finances.getUser(message.author.id, message.guild.id)) return;
    Object.keys(defaultFinance).forEach(k => {
        if (!Database.serverData.has(`${guild}.userData.${user}.finance.${k}`)) Database.serverData.set(`${guild}.userData.${user}.finance.${k}`, defaultFinance[k]);
    })
    const tUser = Finances.getUser(message.author.id, message.guild.id)
    if (Date.now() >= tUser.next) {
        Finances.addBalance(message.author.id, message.guild.id, Math.floor(Util.Arandom(10, 25)));
        Database.serverData.set(`${message.guild.id}.userData.${message.author.id}.finance.next`, Date.now() + 6e4)
        return;
    };
    return;
});
