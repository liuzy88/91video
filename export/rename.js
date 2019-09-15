var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var pool = mysql.createPool(require('../config').db);

function getName(file, callback) {
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log(err.stack);
            callback();
        } else {
            var sql = "SELECT `hash`,`name` FROM videos WHERE `name` IS NOT NULL AND `mp4` LIKE '%/" + file + "' ORDER BY `name`";
            conn.query(sql, function(err, rows) {
                conn.release();
                if (err) {
                    console.log(err.stack);
                    callback();
                } else if (rows.length == 1) {
                    callback(rows[0].hash, rows[0].name);
                } else {
                    callback();
                }
            });
        }
    });
}

function saved(hash, callback) {
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log(err.stack);
            callback();
        } else {
            var sql = "UPDATE videos SET saved=1 WHERE `hash`='" + hash + "'";
            conn.query(sql, function(err, rows) {
                conn.release();
                if (err) {
                    console.log(err.stack);
                }
                callback();
            });
        }
    });
}

var inDir = 'E:/91';
var outDir = 'E:/91Video';
var log = 'rename.log';
var files = [];
var temps = fs.readdirSync(inDir);
for (i in temps) {
    if (temps[i] == 'Thumbs.db') {
        fs.unlinkSync(path.join(inDir, temps[i]));
        reName(++j);
    } else if (temps[i].endsWith('.mp4')) {
        files.push(temps[i]);
    }
}

function reName(j) {
    var file = files[j];
    if (file) {
        getName(file, function(hash, name) {
            if (name) {
                if (fs.existsSync(path.join(outDir, name + '.mp4'))) {
                    fs.unlinkSync(path.join(inDir, file));
                    console.log('(' + (j + 1) + '/' + files.length + ')', file, '->', name + '.mp4', 'but is exists!');
                } else {
                    name = name.replace(/[\\/:*?"<>|]/g,'_');
                    fs.renameSync(path.join(inDir, file), path.join(outDir, name.trim() + '.mp4'));
                    fs.appendFileSync(log, j + '|' + file + '|' + name + '.mp4\n');
                    console.log('(' + (j + 1) + '/' + files.length + ')', file, '->', name + '.mp4');
                }
                saved(hash, function() {
                    reName(++j);
                });
            } else {
                console.log('(' + (j + 1) + '/' + files.length + ')', file, 'cn null or more!');
                reName(++j);
            }
        });
    } else {
        require('./fetch');
    }
}

reName(0);
