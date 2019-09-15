var crypto = require('crypto');
var Worm = require('../lib/worm');

var worm = new Worm({
    workCount: 20,
    charset: 'gbk',
    timeout: 5000,
    init: function() {
        return ["http://200mimi.com/",
            "http://200mimi.com/diao/se27.html",
            // "http://200mimi.com/diao/se28.html",
            // "http://200mimi.com/diao/se29.html",
            // "http://200mimi.com/diao/se34.html",
            // "http://200mimi.com/diao/se54.html",
            // "http://200mimi.com/diao/se55.html",
            // "http://200mimi.com/diao/se56.html",
            // "http://200mimi.com/diao/se57.html",
            // "http://200mimi.com/diao/se58.html",
            // "http://200mimi.com/diaopic/news/se36.html",
            // "http://200mimi.com/diaopic/news/se44.html"
        ]
    },
    matchData: function(history, path, data) {
        var urls = [];
        var regx = /<a href="(\/video[^"]+.html)"/gim;
        while (res = regx.exec(data)) {
            urls.push('http://200mimi.com' + res[1]);   
        }
        return urls;
    },
    matchMp4: function(history, path, data) {
        var mp4s = [];
        var regx0 = /<meta name="description" content="([^"]+)" \/>/;
        var res0 = regx0.exec(data) || ['', ''];
        var name = res0[1];
        if (name.endsWith('在线观看')) {
            name = name.substring(0, name.length - 4).trim();
        }
        var index = name.indexOf('-');
        if (index > 0 && name.substr(0, index).trim() > 0) {
            name = name.substr(index + 1).trim() + '-' + name.substr(0, index).trim();
        }
        name = name.replace(/{playpage:part}{playpage:from}/g, "http://200mimi.com");

        var regx1 = /l:'([^']+.jpg)',/;
        var res1 = regx1.exec(data) || ['', ''];
        var img = '';

        var regx2 = /f:'(http:\/\/[^\']+.mp4)',/;
        var res2 = regx2.exec(data) || ['', ''];
        var mp4 = res2[1];
        if (mp4) {
            var hash = crypto.createHash('md5').update(mp4).digest('hex');
            mp4s.push({ hash: hash, name: name, img: img, mp4: mp4 });
        }
        return mp4s;
    }
});
worm.climb();
