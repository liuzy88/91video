var crypto = require('crypto');
var Worm = require('../lib/worm');

var worm = new Worm({
    workCount: 20,
    charset: 'gbk',
    timeout: 5000,
    init: function() {
        return ['http://52mbmb.com/', 'http://52mbmb.com/list/?2.html'];
    },
    matchData: function(history, path, data) {
        var urls = [];
        if (path.indexOf('list') > 0) {
            // find list
            var regx1 = /<a href="(\/list\/\?[\S]+.html)"/gim;
            while (res = regx1.exec(data)) {
                urls.push('http://52mbmb.com' + res[1]);
            }
            // find detail-page on list-page
            var regx2 = /<a href="(\/detail[\S]+)" target="_blank">/gim;
            while (res = regx2.exec(data)) {
                urls.push('http://52mbmb.com' + res[1]);
            }
        }
        // find video-page on detail-page
        if (path.indexOf('detail') > 0) {
            var regx3 = /<a href="(\/video[\S]+)"><img src="([\S]+)" width="[\d]+" height="[\d]+"  alt="([\S]+)">/gim;
            while (res = regx3.exec(data)) {
                var res1 = 'http://52mbmb.com' + res[1];
                urls.push(res1);
                var h = crypto.createHash('md5').update(res1).digest('hex');
                history.img[h] = res[2].startsWith('/') ? 'http://52mbmb.com' + res[2] : res[2];
                var res3 = res[3];
                var index = res3.indexOf('-');
                if (index > 0 && res3.substr(0, index).trim() > 0) {
                    res3 = res3.substr(index + 1).trim() + '-' + res3.substr(0, index).trim();
                }
                history.name[h] = res3;
            }
        }
        // find video-page on video-page
        if (path.indexOf('video') > 0) {
            var regx3 = /<a href="(\/video[\S]+)" target="_blank"><img src="([\S]+)" onerror="[\S]+" alt="([\S]+)">/gim;
            while (res = regx3.exec(data)) {
                var res1 = 'http://52mbmb.com' + res[1];
                urls.push(res1);
                var h = crypto.createHash('md5').update(res1).digest('hex');
                history.img[h] = res[2].startsWith('/') ? 'http://52mbmb.com' + res[2] : res[2];
                var res3 = res[3];
                var index = res3.indexOf('-');
                if (index > 0 && res3.substr(0, index).trim() > 0) {
                    res3 = res3.substr(index + 1).trim() + '-' + res3.substr(0, index).trim();
                }
                history.name[h] = res3;
            }
        }
        return urls;
    },
    matchMp4: function(history, path, data) {
        var mp4s = [];
        var regx2 = /\$(http:\/\/[\S]+.mp4)\$/gim;
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
