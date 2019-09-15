var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var pool = mysql.createPool(require('../config').db);

var inDir = 'E:/91';
var files = [];
var temps = fs.readdirSync(inDir);
for (i in temps) {
    if (temps[i].endsWith('.mp4')) {
        files.push(temps[i]);
    } else if (temps[i].endsWith('.mp4.td')) {
        files.push(temps[i].replace('.td', ''));
    }
}

function getMp4(page, callback) {
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log(err.stack);
            callback();
        } else {
            var sql = "SELECT `mp4` FROM videos WHERE saved=0 AND `name` IS NOT NULL ";
            if (files.length > 0) {
                sql += " AND `mp4` NOT LIKE '%" + files.join("' AND `mp4` NOT LIKE '%") + "'";
            }
            sql += " ORDER BY `name` LIMIT " + (page * 500) + ",500";
            conn.query(sql, function(err, rows) {
                conn.release();
                if (err) {
                    console.log(err.stack);
                    callback();
                } else {
                    callback(rows);
                }
            });
        }
    });
}

var count = 0;

function fetch(page) {
    getMp4(page, function(rows) {
        if (rows.length > 0) {
            for (i in rows) {
                fs.appendFileSync('fetch.log', rows[i].mp4 + '\r\n');
                count++;
            }
            fetch(++page);
        } else {
            console.log(count + ' exported.');
            process.exit();
        }
    });
}

if (fs.existsSync('fetch.log')) {
    fs.unlinkSync('fetch.log');
}

getMp4(0, function(rows) {
    if (rows.length > 0) {
        for (i in rows) {
            fs.appendFileSync('fetch.log', rows[i].mp4 + '\r\n');
        }
    }
    process.exit();
});
