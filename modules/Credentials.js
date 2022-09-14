const cred = {
    token: "",
    osu: "",
    dbl: ""
};

module.exports = function (key) {
    if (key != obtain("Database").sessionKey) {throw new Error("Invalid session key"); return {}};
    return cred;
}
