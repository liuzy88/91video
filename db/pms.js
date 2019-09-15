var PMS = {};

/* ******** 是否有效值 ******** */

PMS.isValue = function(value) {
    return (typeof value === 'string' || typeof value === 'number') && value !== null && value !== undefined && value != 'null' && value != 'undefined';
}

/* ******** 参数中有效的列名 ******** */

PMS.keys = function(params) {
    var keys = [];
    for (key in params) {
        if (PMS.isValue(params[key])) {
            keys.push(key);
        }
    }
    return keys;
}

/* ******** 参数中有效的列值 ******** */

PMS.values = function(params) {
    var values = [];
    for (key in params) {
        if (PMS.isValue(params[key])) {
            values.push(params[key]);
        }
    }
    return values;
}

module.exports = PMS;
