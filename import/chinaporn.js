var crypto = require('crypto');
var Worm = require('../lib/worm');

var worm = new Worm({
    workCount: 20,
    charset: 'utf8',
    timeout: 5000,
    init: function() {
        var urls = [];
        for (var i = 1; i < 13; i++) {
            urls.push('http://chinapornvideo.com/page-' + i + '.html');
        }
        return urls;
    },
    matchData: function(history, path, data) {
        var urls = [];
        var regx = /<a href="(\/mov\/[^"]+.html\?main)" target="_blank">/gim;
        while (res = regx.exec(data)) {
            urls.push('http://chinapornmovie.com' + res[1]);
        }
        return urls;
    },
    matchMp4: function(history, path, data) {
        var mp4s = [];
        var regx1 = /<img src="([^"]+.jpg)" width="100/;
        var res1 = regx1.exec(data) || ['', ''];
        var img = res1[1] ? 'http://chinapornvideo.com' + res1[1] : '';

        var regx2 = /<a href="(http:\/\/[^\?]+.mp4)/;
        var res2 = regx2.exec(data) || ['', ''];
        var mp4 = res2[1];
        if (mp4) {
            var hash = crypto.createHash('md5').update(mp4).digest('hex');
            mp4s.push({ hash: hash, name: 'chinaporn', img: img, mp4: mp4 });
        }
        return mp4s;
    }
});
worm.climb();
