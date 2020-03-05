const co = require('co');
const fs = require('fs');

const DB = require('../db');
const Conf = require('../conf');

// before use fetch.js, update saved.

co(function*() {
    const tb = 'caobi45';
    yield DB.use(tb);
    const ids = [];
    const files = fs.readdirSync(Conf.exp.reDir);
    for (i in files) {
        ids.push(files[i].split('_')[0]);
    }
    // yield DB.update(`update ${tb} set saved=0`, []);
    // yield DB.update(`update ${tb} set saved=1 where id in (${ids.join(',')})`, []);
    // yield DB.update(`update ${tb} set saved=1 where SUBSTR(mp4, LENGTH(mp4)-38) in (select SUBSTR(mp4, LENGTH(mp4)-38) tmp from ${tb} where saved=1)`, []);
    const data1 = yield DB.query(`select count(*) num from ${tb} where saved=1`, [])
    const data2 = yield DB.query(`select count(*) num from ${tb} where saved=0`, [])
    console.log(`${files.length} files downloaded, ${data1[0].num} rows saved, and ${data2[0].num} not.`);
}).catch(function(err) {
    console.log(err);
})