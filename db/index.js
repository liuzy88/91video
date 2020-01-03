const co = require('co');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const conf = require('../conf').db;
const model = require('./model');

const DB = {};

DB.useMySQL = conf.dialect === 'mysql';

DB.sequelize = undefined;

function init() {
    DB.sequelize = DB.useMySQL ? new Sequelize(conf.database, conf.mysql.user, conf.mysql.password, {
        dialect: 'mysql',
        timezone: '+08:00',
        dialectOptions: {charset: "utf8", },
        host: conf.mysql.host,
        port: conf.mysql.port,
        pool: {min: 0, max: 5, acquire: 30000, idle: 10000, },
        logging: conf.showSql === false ? false : console.log,
    }) : new Sequelize(conf.database, null, null, {
        dialect: 'sqlite',
        storage: path.join(__dirname, '../' + conf.sqlite.storage),
        logging: conf.showSql === false ? false : console.log,
    });
}

DB.query = function (sql, pms) {
    return DB.sequelize.query(sql, {
        raw: true,
        replacements: pms,
        type: DB.sequelize.QueryTypes.SELECT,
    });
};

DB.update = function (sql, pms) {
    return DB.sequelize.query(sql, {
        replacements: pms,
    });
};

DB.use = function (table) {
    if (DB.sequelize === undefined) {
        init();
    }
    return function (cb) {
        co(function* () {
            DB.table = table;
            DB.Model = DB.sequelize.define(table, model, {
                tableName: table,
                timestamps: false,
                charset: 'utf8',
            });
            DB.Model.replace = function (obj) {
                return DB.update("REPLACE INTO `" + table + "`(id,url,title,mp4,jpg) VALUES(?,?,?,?,?)",
                    [obj.id, obj.url, obj.title, obj.mp4, obj.jpg]);
            };
            yield DB.Model.sync({force: false, alter: false});
            cb(null, DB.Model);
        }).catch((err) => {
            cb(err);
        });
    }
};

module.exports = DB;
