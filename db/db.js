var Table = require('./table');
var Query = require('./query');
var SQL = require('./sql');
var PMS = require('./pms');

var DB = {};

function isValue(value) {
    return PMS.isValue(value) && value != '';
}

SQL.defaultID('hash');
DB.Videos = new Table('videos', {
    findbyHash: function(params) {
        var sql = 'SELECT `hash` FROM `videos` WHERE `hash`=? LIMIT 1';
        var pms = [params.hash];
        return Query(sql, pms);
    },
    allimgs: function(params) {
        var sql = "SELECT `hash`, `img` FROM `videos` WHERE `img` != ''";
        var pms = [];
        return Query(sql, pms);
    }
});

module.exports = DB;
