var Promise = require('promise');
var mysql = require('mysql');
var pool = mysql.createPool(require('../config').db);

function datetime() {
    var d = new Date();
    return [d.getFullYear(), '-',
        ('0' + (d.getMonth() + 1)).slice(-2), '-',
        ('0' + d.getDate()).slice(-2), ' ',
        ('0' + d.getHours()).slice(-2), ':',
        ('0' + d.getMinutes()).slice(-2), ':',
        ('0' + d.getSeconds()).slice(-2)
    ].join('');
}

function log() {
    var args = [datetime()];
    for (k in arguments) {
        args.push(arguments[k]);
    }
    //console.log(args.join(' '));
}

function Query(sql, pms) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, conn) {
            if (err) {
                log(err.stack);
                reject(err.stack);
            }
            log('[SQL]', sql);
            log('[PMS]', pms.toString());
            conn.query(sql, pms, function(err, rows) {
                if (err) {
                    log(err.stack);
                    reject(err.stack);
                }
                log('[ROW]', JSON.stringify(rows));
                conn.release();
                resolve(rows);
            });
        });
    });
}

module.exports = Query;
