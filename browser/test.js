const co = require('co');

const Browser = require('./index');

co(function*() {
   const ret = yield Browser.GET('http://www.caobi45.com/index.html');
   console.log(ret);
}).catch((err) => {
    console.error(err);
});