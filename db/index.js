const co = require('co');
const fs = require('fs');
const path = require('path');

const Driver = require('./driver');

module.exports.useMySQL = Driver.useMySQL;

module.exports.query = function (sql, pms) {
    return Driver.sequelize.query(sql, {
        raw: true,
        replacements: pms,
        type: Driver.sequelize.QueryTypes.SELECT,
    });
};

module.exports.update = function (sql, pms) {
    return Driver.sequelize.query(sql, {
        replacements: pms,
    });
};

module.exports.init = function () {
    return function (cb) {
        co(function* () {
            const modelDir = path.join(__dirname, './models');
            const files = fs.readdirSync(modelDir);
            for (let i = 0; i < files.length; i++) {
                const file = path.join(modelDir, files[i]);
                if (file.endsWith('.js') && !file.endsWith('_data.js')) {
                    try {
                        let model = require(file);
                        let name = model.name;
                        name = name.charAt(0).toUpperCase() + name.slice(1);
                        module.exports[name] = model;
                        yield model.sync({force: false, alter: false});
                        let datafile = path.join(modelDir, model.name + '_data.js');
                        if (fs.existsSync(datafile)) {
                            let count = yield model.count();
                            if (count === 0) {
                                let data = require(datafile);
                                model.bulkCreate(data);
                            }
                        }
                        let sqlfile = path.join(modelDir, model.name + '_data.sql');
                        if (fs.existsSync(sqlfile)) {
                            let count = yield model.count();
                            if (count === 0) {
                                let data = fs.readFileSync(sqlfile, 'utf8');
                                Driver.sequelize.query(data, {
                                    raw: true,
                                    type: Driver.sequelize.QueryTypes.INSERT,
                                });
                            }
                        }
                    } catch (err) {
                        console.error('加载Model异常', file, err)
                    }
                }
            }
            cb(null);
        }).catch((err) => {
            cb(err);
        });
    }
};
