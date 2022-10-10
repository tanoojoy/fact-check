
module.exports.generateTempId = () => {
    var str = Math.random().toString();
    var n = str.lastIndexOf(".");
    str = str.substring(n + 1, str.length - n);
    return str;
}

module.exports.capitalize = (s) => {
    return s && s[0].toUpperCase() + s.slice(1);
}