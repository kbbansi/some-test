const bcrypt = require('bcrypt');

let salt, passHash;

exports.passwordHash = function (password) {
    salt = bcrypt.hashSync(password, 4);
    return salt;
};

exports.hashCompare = function (stringPassword, hash) {
    passHash = bcrypt.compareSync(stringPassword, hash);
    return passHash;
};