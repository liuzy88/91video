const co = require('co');
const http = require('http');

const DB = require('./db');

co(function* () {
    console.log('Web listening...');
}).catch(function (err) {
    console.error(err);
});