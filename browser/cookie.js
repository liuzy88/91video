const path = require('path');
const fs = require('fs');

const Conf = require('../conf');
const Comm = require('../comm');

const file = path.join(Conf.imp.cacheDir, '.cookie');
const cookie = {};

module.exports.append = function (options) {
    // TODO
};

module.exports.remember = function (options, headers) {
    const array = headers['set-cookie'];
    if (array && array.length > 0) {
        for (let i = 0; i < array.length; i++) {
            const kv = array[0].trim().split(';')[0];
            const arr = kv.trim().split('=');
            const k = arr[0].trim();
            cookie[k] = arr[1].trim();
        }
        const cookies = JSON.stringify(cookie, null, 2);
        fs.writeFile(file, cookies, 'utf8', function (err) {
            if (err) {
                console.error('write cookie err', err);
            }
        });
    }
};