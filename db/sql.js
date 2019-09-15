var PMS = require('./pms');
var SQL = {};
var ID_NAME = 'id';

SQL.defaultID = function(id_name) {
    ID_NAME = id_name;
}

/* ******** 插入和替换插入 ******** */

SQL.insertSql = function(table, params) {
    var keys = PMS.keys(params);
    var qs = [];
    for (i in keys) {
        qs.push('?');
    }
    return 'INSERT INTO `' + table + '`(`' + keys.join('`,`') + '`) VALUES(' + qs.join(',') + ')';
}

SQL.insertPms = function(params) {
    return PMS.values(params);
}

SQL.replaceSql = function(table, params) {
    var keys = PMS.keys(params);
    var qs = [];
    for (i in keys) {
        qs.push('?');
    }
    return 'REPLACE INTO `' + table + '`(`' + keys.join('`,`') + '`) VALUES(' + qs.join(',') + ')';
}

SQL.replacePms = function(params) {
    return PMS.values(params);
}

/* ******** 按ID更新 ******** */

SQL.updatebyidSql = function(table, params, id) {
    id = id || ID_NAME;
    if (PMS.isValue(params[id])) {
        var temp = [];
        for (key in params) {
            if (key != id) {
                if (PMS.isValue(params[key])) {
                    temp.push('`' + key + '`=?');
                }
            }
        }
        return 'UPDATE `' + table + '` SET ' + temp.join(', ') + ' WHERE `' + id + '`=?';
    } else {
        throw new Error('params not found ' + id + ' or value is invalid !');
    }
}

SQL.updatebyidPms = function(params, id) {
        id = id || ID_NAME;
        var pms = [];
        for (key in params) {
            if (key != id) {
                if (PMS.isValue(params[key])) {
                    pms.push(params[key]);
                }
            }
        }
        pms.push(params[id]);
        return pms;
    }
    /* ******** 按ID删除 ******** */

SQL.deletebyidSql = function(table, params, id) {
    id = id || ID_NAME;
    if (PMS.isValue(params[id])) {
        return 'DELETE FROM `' + table + '` WHERE `' + id + '`=?';
    } else {
        throw new Error('params not found ' + id + ' or value is invalid !');
    }
}

SQL.deletebyidPms = function(params, id) {
    id = id || ID_NAME;
    return [params[id]];
}

/* ******** 按ID查询 ******** */

SQL.findbyidSql = function(table, params, id) {
    id = id || ID_NAME;
    if (PMS.isValue(params[id])) {
        return 'SELECT * FROM `' + table + '` WHERE `' + id + '`=?';
    } else {
        throw new Error('params not found ' + id + ' or value is invalid !');
    }
}

SQL.findbyidPms = function(params, id) {
    id = id || ID_NAME;
    return [params[id]];
}

module.exports = SQL;

/* 测试 */
/*
var params = {
    id: 1,
    name: 'liuzy',
    age: 28,
    obj: { k: 'v' }, // No
    arr: [1, 2], // No
    stat1: true, // No
    stat2: 'true',
    stat3: false, // No
    stat4: 'false',
    empty: '',
    kong: 'null', // No
    null: null, // No
    un: undefined, // No
    ud: 'undefined' // No
};
// 增
console.log(SQL.insertSql('users', params));
console.log(SQL.insertPms(params));
console.log(SQL.replaceSql('users', params));
console.log(SQL.replacePms(params));
// 改
console.log(SQL.updatebyidSql('users', params));
console.log(SQL.updatebyidPms(params));
console.log(SQL.updatebyidSql('users', params, 'name'));
console.log(SQL.updatebyidPms(params, 'name'));
// 删
console.log(SQL.deletebyidSql('users', params));
console.log(SQL.deletebyidPms(params));
console.log(SQL.deletebyidSql('users', params, 'name'));
console.log(SQL.deletebyidPms(params, 'name'));
// 查
console.log(SQL.findbyidSql('users', params));
console.log(SQL.findbyidPms(params));
console.log(SQL.findbyidSql('users', params, 'name'));
console.log(SQL.findbyidPms(params, 'name'));
*/
