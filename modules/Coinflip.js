var exports = module.exports = {};
const Database = obtain("Database");
const Coinflip = obtain("Coinflip");
const Finances = obtain("Finances");
const Util = obtain("Util");

exports.newMatch = function(user, guild, amount, cside, newid) {
    if (!Finances.getUser(user, guild)) return;
    Finances.addBalance(user, guild, -Util.DecimalAdjust("round", amount, -2))
    Database.serverData.set(`${guild}.coinFlips.${user}`, {stake: amount, side: cside, timeout: (Date.now() + 6e4 * 30), id: newid})
};

exports.findMatchById = function(guild, id) {
    let t = Database.serverData.get(`${guild}.coinFlips`).array()
    for (let i = 0; i < Object.keys(t).length; i++) {
        if (t[i][1].id == id) return [t[i][0], t[i][1]]
    }
    return false;
}

exports.deleteMatch = function(user, guild) {
    if (!Finances.getUser(user, guild)) return;
    if (!Coinflip.findUserMatch(user, guild)) return;
    Database.serverData.delete(`${guild}.coinFlips.${user}`)
}

exports.findUserMatch = function(user, guild) {
    if (!Finances.getUser(user, guild)) return;
    if (Database.serverData.has(`${guild}.coinFlips.${user}`)) return Database.serverData.get(`${guild}.coinFlips.${user}`);
    return false;
}
