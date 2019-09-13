const path = require('path');
const fs = require('fs');

const cacheDir = path.join(__dirname, '../.cache');

function mkdirs(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
}

mkdirs(cacheDir);

module.exports.write = function (options, data) {
    const file = path.join(cacheDir, options.host + options.path);
    const dir = path.resolve(file, '..');
    mkdirs(dir);
    fs.writeFile(file, data, 'utf8', function (err) {
        if (err) {
            console.error('写缓存失败', err);
        }
    });
};

module.exports.read = function (options) {
    const file = path.join(cacheDir, options.host + options.path);
    if (fs.existsSync(file)) {
        return fs.readFileSync(file, 'utf8');
    }
    return;
};