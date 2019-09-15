const path = require('path');
const fs = require('fs');

const Conf = require('../conf');
const Comm = require('../comm');

const cacheDir = Conf.imp.cacheDir;

Comm.mkDirs(cacheDir);

module.exports.write = function (options, data) {
    const file = path.join(cacheDir, options.host, Comm.winName(options.path));
    Comm.mkDirs(path.dirname(file));
    fs.writeFile(file, data, 'utf8', function (err) {
        if (err) {
            console.error('write cache err', err);
        }
    });
};

module.exports.read = function (options) {
    const file = path.join(cacheDir, options.host, Comm.winName(options.path));
    if (fs.existsSync(file)) {
        return fs.readFileSync(file, 'utf8');
    }
    return '';
};