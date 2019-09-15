var Query = require('./query');
var SQL = require('./sql');

function Table(name, obj) {
    var _this = obj || {};
    _this.tableName = name;
    if (!_this.searchCount) {
        _this.searchCount = function(params) {
            var sql = 'SELECT COUNT(*) AS num FROM `' + _this.tableName + '`';
            if (params._where) {
                sql += ' WHERE ' + params._where;
            }
            var pms = [];
            return Query(sql, pms);
        }
    }
    if (!_this.searchList) {
        _this.searchList = function(params) {
            var sql = 'SELECT * FROM `' + _this.tableName + '`';
            if (params._where) {
                sql += ' WHERE ' + params._where;
            }
            if (params._orderby) {
                sql += ' ORDER BY ' + params._orderby;
            }
            sql += ' limit ?, ?';
            var pms = [(params.page - 1) * params.rows, params.rows];
            return Query(sql, pms);
        }
    }
    if (!_this.findbyid) {
        _this.findbyid = function(params) {
            var sql = SQL.findbyidSql(_this.tableName, params);
            var pms = SQL.findbyidPms(params);
            return Query(sql, pms);
        }
    }
    if (!_this.insert) {
        _this.insert = function(params) {
            var sql = SQL.insertSql(_this.tableName, params);
            var pms = SQL.insertPms(params);
            return Query(sql, pms);
        }
    }
    if (!_this.replace) {
        _this.replace = function(params) {
            var sql = SQL.replaceSql(_this.tableName, params);
            var pms = SQL.replacePms(params);
            return Query(sql, pms);
        }
    }
    if (!_this.update) {
        _this.update = function(params) {
            var sql = SQL.updatebyidSql(_this.tableName, params);
            var pms = SQL.updatebyidPms(params);
            return Query(sql, pms);
        }
    }
    if (!_this.del) {
        _this.del = function(params) {
            var sql = SQL.deletebyidSql(_this.tableName, params);
            var pms = SQL.deletebyidPms(params);
            return Query(sql, pms);
        }
    }
    return _this;
}

module.exports = Table;
