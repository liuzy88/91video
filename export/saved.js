const co = require('co');
const fs = require('fs');

const DB = require('../db');
const Conf = require('../conf');

co(function*() {
    const tb = 'caobi45';
    const ids = [];
    const files = fs.readdirSync(Conf.exp.reDir);
    for (i in files) {
        ids.push(files[i].split('_')[0]);
    }
    console.log('total files:', files.length);
    yield DB.use(tb);
    yield DB.update(`update ${tb} set saved=0`, []);
    yield DB.update(`update ${tb} set saved=1 where id in (${ids.join(',')})`, []);
    console.log(yield DB.query(`select count(*) num from ${tb} where saved=1`, []));
}).catch(function(err) {
    console.log(err);
})