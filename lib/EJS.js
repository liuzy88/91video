var fs = require('fs');
var path = require('path');
var config = require('../config');
var EJS = {};

EJS.datetime = function(t) {
    var d = new Date(t);
    return [d.getFullYear(), '-',
        ('0' + (d.getMonth() + 1)).slice(-2), '-',
        ('0' + d.getDate()).slice(-2), ' ',
        ('0' + d.getHours()).slice(-2), ':',
        ('0' + d.getMinutes()).slice(-2), ':',
        ('0' + d.getSeconds()).slice(-2)
    ].join('');
}

EJS.date = function(t) {
    var d = new Date(t);
    return [d.getFullYear(), '-',
        ('0' + (d.getMonth() + 1)).slice(-2), '-',
        ('0' + d.getDate()).slice(-2)
    ].join('');
}

module.exports = EJS;
