var exports = module.exports = {};
exports.blacklisted = [];

exports.permissions = function(user, guild) {
    if (user == 155071784805203968) return 3;
    if (this.blacklisted.indexOf(user) > -1) return 0;
    return 1;
};
