const co = require('co');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DB = require('../db');

const dlDir = 'E:/91';
const reDir = 'E:/91video';
const logFile = 'rename.log';
const errFile = 'rename.err';

co(function* () {
    yield DB.init();
    mkdirs(reDir);
    const videos = dlFiles(dlDir);
    for (let i = 0; i < videos.length; i++) {
        const name = videos[i];
        const src = path.join(dlDir, name);
        const data = yield DB.Videos.findAll({
            where: {
                mp4: {[Op.endsWith]: name},
            },
            raw: true,
        });
        if (data.length === 0) {
            errLog(`Warning record not found! name=${name}`);
            continue;
        } else {
            if (data.length > 1) {
                errLog(`Warning ${data.length} record! name=${name}`);
                data.map(function (x) {
                    errLog(`\t${x.id} ${x.title}`);
                });
            }
            const newName = `${padLeft(data[0].id)}_${data[0].title.replace(/[\\:\/*?"|]/gim, '_')}`;
            const dst = path.join(reDir, newName);
            if (fs.existsSync(dst)) {
                errLog(`Warning dst exists! name=${name}`);
                errLog(`\tdst=${dst}`);
                continue;
            }
            try {
                fs.renameSync(src, dst);
                fs.appendFileSync(logFile, `${name} => ${newName}\r\n`, 'utf8');
            } catch (e) {
                errLog(`Warning rename failed! ${e.message}`);
                errLog(`\tsrc=${src}`);
                errLog(`\tdst=${dst}`);
            }
        }
    }
    console.log(`Complete.`)
}).catch(function (err) {
    console.error(err);
});

function mkdirs(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
}

function dlFiles(dir) {
    const files = [];
    const temps = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    for (let i = 0; i < temps.length; i++) {
        if (temps[i].endsWith('.mp4')) {
            files.push(temps[i]);
        }
    }
    return files;
}

function padLeft(id) {
    return ('00000' + id.toString()).slice(-5);
}


function errLog(msg) {
    console.log(msg);
    fs.appendFileSync(errFile, msg + '\r\n', 'utf8');
}
