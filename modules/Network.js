const events = require("events");
const fs = require("fs");

class Emitter extends events {};
const NetworkEmitter = new Emitter();

module.exports.Emitter = NetworkEmitter;
module.exports.events = {"clientReady" : "1", "messageReceived" : "2"}

NetworkEmitter.setMaxListeners(25);

module.exports.obtain = function(mod) {
    const modules = fs.readdirSync("./modules");
    for (let i = 0; i < Object.keys(modules).length; i ++) {
        if (modules[i].indexOf(".js") == -1) return
        const thisMod = modules[i].substring(0, modules[i].length - 3);
        if (thisMod == mod) return require(`./${modules[i]}`);
    };
    throw new ReferenceError(`No module named "${mod}" was found`)
}
