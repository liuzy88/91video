const co = require('co');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const conf = require('../conf').db;
const model = require('./model');

const DB = {};

DB.useMySQL = conf.dialect === 'mysql';

DB.sequelize = DB.useMySQL ? new Sequelize(conf.database, conf.user, conf.password, {
    timezone: '+08:00',
    dialect: 'mysql',
    dialectOptions: {charset: "utf8",},
    pool: {min: 0, max: 5, acquire: 30000, idle: 10000},
}) : new Sequelize(conf.database, null, null, {
    dialect: 'sqlite',
    logging: conf.showSql === false ? false : console.log,
    storage: path.join(__dirname, '../' + conf.sqlite.storage),
});

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
    return function (cb) {
        co(function* () {
            DB.table = table;
            DB.Model = DB.sequelize.define(table, model, {
                tableName: table,
                timestamps: false,
                charset: 'utf8',
            });
            DB.Model.replace = function (obj) {
                return DB.query("REPLACE INTO `" + table + "`(id,url,title,mp4) VALUES(?,?,?,?)",
                    [obj.id, obj.url, obj.title, obj.mp4]);
            };
            yield DB.Model.sync({force: false, alter: false});
            cb(null);
        }).catch((err) => {
            cb(err);
        });
    }
};

module.exports = DB;
