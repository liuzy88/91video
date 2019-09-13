const co = require('co');

const DB = require('./index');

co(function* () {
    const ret1 = yield DB.Videos.create({url: 'http://baidu.com/', title: '百度'});
    console.log(ret1);
    const ret2 = yield DB.Videos.findByPk(1, {raw: true});
    console.log(ret2);
}).catch(function (err) {
    console.error(err);
});