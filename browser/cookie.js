const path = require('path');
const fs = require('fs');
const Cookie = require('cookie');

const Conf = require('../conf');
const Comm = require('../comm');

const file = path.join(Conf.imp.cacheDir, '.cookie');
let obj = undefined;

function loadCache() {
    console.log(`read cookie: ${file}`);
    if (fs.existsSync(file)) {
        try {
            const data = fs.readFileSync(file, 'utf8');
            obj = JSON.parse(data) || {}
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports.append = function(options) {
    if (obj === undefined) {
        loadCache()
    }
};

module.exports.remember = function(options, headers) {
    if (obj === undefined) {
        loadCache()
    }
    const cookies = headers['set-cookie'] || [];
    if (cookies.length > 0) {
        for (let i = 0; i < cookies.length; i++) {
            const cookie = Cookie.parse(cookies[0].trim());
            obj[Object.keys(cookie)[0]] = cookie
        }
        fs.writeFile(file, JSON.stringify(obj, null, 2), 'utf8', function(err) {
            if (err) {
                console.error('write cookie err', err)
            }
        });
    }
};
