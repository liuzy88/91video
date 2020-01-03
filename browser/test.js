const co = require('co');

const Browser = require('./index');

co(function* () {
    Browser.setCharset('www.caobi45.com', 'gb2312');
    const ret = yield Browser.GET('http://www.caobi45.com/index.html');
    console.log(ret);
}).catch((err) => {
    console.error(err);
});