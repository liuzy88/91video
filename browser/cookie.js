const path = require('path');
const fs = require('fs');

const Conf = require('../conf');
const Comm = require('../comm');

const file = path.join(Conf.imp.cacheDir, '.cookie');
const cookie = {};

module.exports = function (options, headers) {
    const kvs = headers['set-cookie'];
    if (kvs) {
        kvs.trim().split(';').map(function(kv) {
            const arr = kv.trim().split('=');
            const k = arr[0].trim();
            cookie[k] = arr[1].trim();
        });
        const cookies = JSON.stringify(cookie, null, 2);
        fs.writeFile(file, cookies, 'utf8', function(err) {
            if (err) {
                console.error('write cookie err', err);
            }
        });
    }
};