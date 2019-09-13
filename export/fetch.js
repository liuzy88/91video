const co = require('co');
const fs = require('fs');

const DB = require('../db');

const dlDir = 'E:/91';
const rows = 500;
const pageFile = 'fetch.page';
const outFile = 'fetch.txt';

co(function*() {
    yield DB.init();
    const page = getPage();
    const exFiles = dlFiles(dlDir);
    let sql = `SELECT id, mp4 FROM videos WHERE saved=0`;
    if (exFiles.length > 0) {
        sql += ` AND mp4 NOT LIKE '%${exFiles.join(`' AND \`mp4\` NOT LIKE '%`)}'`;
    }
    sql += ` ORDER BY id LIMIT ${(page - 1) * rows}, ${rows}`;
    let pms = [];
    const data = yield DB.query(sql, pms);
    console.log(`Fetch page ${page} count ${data.length}`);
    if (data.length > 0) {
        setNextPage(page + 1);
        for (let i = 0; i < data.length; i++) {
            fs.appendFileSync(outFile, `${data[i].mp4}?id=${data[i].id}\r\n`);
        }
    }
    console.log(`Complete.`)
}).catch(function (err) {
    console.error(err);
});

function dlFiles(dir) {
    const files = [];
    const temps = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    for (let i = 0; i < temps.length; i++) {
        if (temps[i].endsWith('.mp4')) {
            files.push(temps[i]);
        } else if (temps[i].endsWith('.mp4.td')) {
            files.push(temps[i].replace('.td', ''));
        }
    }
    return files;
}

function getPage() {
    if (fs.existsSync(pageFile)) {
        const data = fs.readFileSync(pageFile, 'utf8') || '1';
        return parseInt(data.trim() || '1');
    }
    return 1;
}

function setNextPage(page) {
    if (fs.existsSync(outFile)) {
        fs.unlinkSync(outFile);
    }
    fs.writeFileSync(pageFile, page);
}
