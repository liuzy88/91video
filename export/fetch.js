const co = require('co');
const fs = require('fs');

const DB = require('../db');
const Conf = require('../conf');
const Comm = require('../comm');

const dlDir = Conf.exp.dlDir;
const skip = 0;
const rows = 1000;
const page = 1;
const pageFile = 'fetch.page';
const outFile = 'fetch.txt';

co(function*() {
    const model = yield DB.use('caobi45');
    // const page = Comm.readFileInt(pageFile, 1);
    const exFiles = Comm.mp4TempFiles(dlDir);
    let sql = `SELECT id, mp4, SUBSTR(mp4,LENGTH(mp4)-38) AS fname FROM ${model.tableName} WHERE saved=0 and id>${skip}`;
    if (exFiles.length > 0) {
        sql += ` AND fname NOT IN ('${exFiles.join(`','`)}')`;
    }
    sql += ` GROUP BY fname`;
    sql += ` ORDER BY id LIMIT ${(page - 1) * rows}, ${rows}`;
    let pms = [];
    const data = yield DB.query(sql, pms);
    console.log(`Fetch page ${page} count ${data.length}`);
    if (data.length > 0) {
        // Comm.writeFileVal(pageFile, page + 1);
        if (fs.existsSync(outFile)) {
            fs.unlinkSync(outFile);
        }
        for (let i = 0; i < data.length; i++) {
            fs.appendFileSync(outFile, `${data[i].mp4}#id=${('00000' + data[i].id).slice(-5)}\r\n`);
        }
    }
    console.log(`Complete.`)
}).catch((err) => {
    console.error(err);
});
