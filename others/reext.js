const fs = require('fs');
const path = require('path');

const Conf = require('../conf');

const what = '.tmp';

const files = fs.readdirSync(Conf.exp.dlDir);
for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.endsWith(what)) {
        const src = path.join(Conf.exp.dlDir, file);
        const dst = path.join(Conf.exp.dlDir, file.replace(what, '.mp4'));
        fs.renameSync(src, dst);
    }
}