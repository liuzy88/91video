const path = require('path');
const Sequelize = require('sequelize');

const conf = require('../conf').db;

const useMySQL = conf.dialect === 'mysql';

const sequelize = useMySQL ? new Sequelize(conf.database, conf.user, conf.password, {
    timezone: '+08:00',
    dialect: 'mysql',
    dialectOptions: {
        charset: "utf8",
    },
    pool: {
        min: 0,
        max: 5,
        acquire: 30000,
        idle: 10000
    },
}) : new Sequelize(conf.database, null, null, {
    dialect: 'sqlite',
    logging: conf.showSql === false ? false : console.log,
    storage: path.join(__dirname, '../' + conf.sqlite.storage),
});

module.exports.useMySQL = useMySQL;
module.exports.sequelize = sequelize;

module.exports.define = function (name, attributes) {
    const attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {type: value};
        }
    }
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        charset: 'utf8',
    });
};