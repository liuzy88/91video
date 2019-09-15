var DB = require('./db/db');
var path = require('path');
var fs = require('fs');
var config = require('./config');

var imageDir = 'D:/SvnLiuzy/node/realvideo/resource';

function download(item) {
    var http;
    if (item.img.startsWith('https')) {
        http = require("https");
    } else {
        http = require("http");
    }
    var jpg = path.join(imageDir, item.hash + '.jpg');
    if (!fs.existsSync(jpg)) {
        var req = http.get(item.img, function(res) {
            res.setTimeout(5000);
            res.setEncoding("binary");
            var buff = [];
            res.on('data', function(chunk) {
                buff.push(new Buffer(chunk));
            });
            res.on("end", function() {
                fs.writeFile(jpg, Buffer.concat(buff), "binary");
            });
        });
        req.on('error', function(err) {
            console.log(err);
        });
        req.end();
    }
}

DB.Videos.allimgs({}).then(function(data) {
    for (i in data) {
        download(data[i]);
    }
}).catch(function(e) {
    console.log(e);
});
