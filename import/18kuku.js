var crypto = require('crypto');
var Worm = require('../lib/worm');

var worm = new Worm({
    workCount: 20,
    charset: 'gbk',
    timeout: 5000,
    init: function() {
        return ['http://www.18kuku.com'];
    },
    matchData: function(history, path, data) {
        var urls = [];
        var regx = /<a href="(\/[^"]+.html)" target="_blank"><img src="(http[^"]+.jpg)" title="([^"]+)" /gim;
        while (res = regx.exec(data)) {
            var res1 = 'http://www.18kuku.com' + res[1];
            urls.push(res1);
            var h = crypto.createHash('md5').update(res1).digest('hex');
            history.img[h] = res[2];
            var res3 = res[3];
            if (res3.endsWith('在线观看')) {
                res3 = res3.substring(0, res3.length - 4).trim();
            }
            var index = res3.indexOf('-');
            if (index > 0 && res3.substr(0, index).trim() > 0) {
                res3 = res3.substr(index + 1).trim() + '-' + res3.substr(0, index).trim();
            }
            history.name[h] = res3;
        }
        return urls;
    },
    matchMp4: function(history, path, data) {
        var mp4s = [];
        var regx2 = /f:'(http:\/\/[^\']+.mp4)',/;
        var res2 = regx2.exec(data) || ['', ''];
        var mp4 = res2[1];
        if (mp4) {
            var hash = crypto.createHash('md5').update(mp4).digest('hex');
            var h = crypto.createHash('md5').update(path).digest('hex');
            mp4s.push({ hash: hash, name: history.name[h], img: history.img[h], mp4: mp4 });
        }
        return mp4s;
    }
});
worm.climb();
