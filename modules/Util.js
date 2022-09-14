var exports = module.exports = {};
const crypto = require("crypto")

exports.Arandom = function(min, max) {
    return Math.random() * (max - min) + min;
}

exports.CryptoRandom = function(){
    with (crypto) {
        let s1 = randomBytes(16).toString('hex').toLowerCase();
        let s2 = randomBytes(16).toString('hex').toLowerCase();
        let hmac = createHmac('SHA512', s1);
        hmac.write(s2);
        let buf = hmac.digest();
        return buf.readUInt32BE() / Math.pow(2, 32) * 100;
    }
}

exports.FloorDifference = function(int) {
    return [int - Math.floor(int), int]
}

exports.FormatSeconds = function(origin) {
    let days = this.FloorDifference(origin/60/60/24)
    let hours = this.FloorDifference(days[0]*24)
    let minutes = this.FloorDifference(hours[0]*60)
    let seconds = this.FloorDifference(minutes[0]*60)
    let r = [days, hours, minutes, seconds]
    Object.keys(r).forEach(i => {
        r[i] = Math.floor(r[i][1]);
    });
    return r
}

exports.DecimalAdjust = function(type, value, exp) {
    if (typeof exp === 'undefined' || +exp === 0) {return Math[type](value);}
    value = +value;
    exp = +exp;
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {return NaN;}
    if (value < 0) {return -this.DecimalAdjust(type, -value, exp); }
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}


exports.permutation = function(t) {
    let perms = [];
    let recurse = function(int, array){
        if (int === 1) perms.push(array.slice())
        for (let i = 0; i < int; i++) {
            recurse(int - 1, array);
            if (int % 2 === 0) {
                let t = array[0]
                array[0] = array[int - 1];
                array[int - 1] = t;
            } else {
                let t = array[i]
                array[i] = array[int - 1]
                array[int - 1] = t
            }
        }
    }

recurse(t.length, t)

return perms
}
