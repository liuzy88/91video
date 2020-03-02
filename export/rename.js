const co = require('co');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DB = require('../db');
const Conf = require('../conf');
const Comm = require('../comm');

const dlDir = Conf.exp.dlDir;
const reDir = Conf.exp.reDir;
const logFile = 'rename.log';
const errFile = 'rename.err';

// execute, where Thunder downloaded a batch.

co(function* () {
    yield DB.use('caobi45');
    Comm.mkDirs(reDir);
    const videos = Comm.mp4Files(dlDir);
    console.log(`Rename ${videos.length} files...`);
    for (let i = 0; i < videos.length; i++) {
        const file = videos[i];
        const src = path.join(dlDir, file);
        if (fs.statSync(src).size < 20480) {
            errLog(`Warning invalid file! name=${file}`);
            fs.unlinkSync(src);
            continue;
        }
        const data = yield DB.Model.findAll({
            where: {
                mp4: {[Op.endsWith]: file},
            },
            raw: true,
        });
        if (data.length === 0) {
            errLog(`Warning record not found! name=${file}`);
        } else {
            if (data.length > 1) {
                errLog(`Warning ${data.length} record! name=${file}`);
                data.map(function (x) {
                    errLog(`\t${x.id} ${x.title}`);
                });
            }
            let name = data[0].title.trim();
            if (name.indexOf('http:/') !== -1) {
                name = name.split('http:/')[0] + Date.now().toString();
            }
            const newName = Comm.newName(data[0].id, name);
            const dst = path.join(reDir, newName);
            if (fs.existsSync(dst)) {
                errLog(`Warning dst exists! name=${file}`);
                errLog(`\tdst=${dst}`);
                fs.renameSync(src, path.join(dlDir, newName));
                continue;
            }
            try {
                fs.renameSync(src, dst);
                // fs.appendFileSync(logFile, `${file} => ${newName}\r\n`, 'utf8');
                const count = yield DB.Model.update({saved: 1}, {where: {mp4: {[Op.endsWith]: file}}});
                console.log(`Rename ${count} record by ${file}`);
            } catch (e) {
                errLog(`Warning rename failed! ${e.message}`);
                errLog(`\tsrc=${src}`);
                errLog(`\tdst=${dst}`);
            }
        }
    }
    console.log(`Complete.`)
}).catch((err) => {
    console.error(err);
});

function errLog(msg) {
    console.log(msg);
    // fs.appendFileSync(errFile, msg + '\r\n', 'utf8');
}
