var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var config = require('./config');
var DB = require('./db/db');

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.locals.EJS = require('./lib/EJS');
var config = require('./config');

app.use(require('./lib/logger').reqlog);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.header("Pragma", "no-cache"); // HTTP 1.0.
    res.header("Expires", "0"); // Proxies.
    next();
});

app.get('/', function(req, res, next) {
    var ips = config.ips;
    var flag = true;
    for (i in ips) {
        if (req.uip == ips[i]) {
            flag = false;
            break;
        }
    }
    if (flag) {
        res.render('login');
        return;
    }
    var params = { page: 1, rows: 10, _orderby: "`uptime` DESC" };
    if (req.query.p > 0) {
        params.page = req.query.p;
        var count;
        DB.Videos.searchCount(params).then(function(data) {
            count = data[0].num;
            if (params.page > Math.ceil(count / params.rows)) {
                res.end('end');
                return Promise.reject();
            } else {
                return DB.Videos.searchList(params);
            }
        }).then(function(data) {
            res.render('data', { data: data });
        });
    } else {
        var count;
        DB.Videos.searchCount(params).then(function(data) {
            count = data[0].num;
            return DB.Videos.searchList(params);
        }).then(function(data) {
            res.render('index', { data: data });
        });
    }
});

app.use(function(req, res, next) {
    res.status(404).send('404 Not Found');
});

app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('500 Server Error');
});

var server = require('http').createServer(app);
server.on('error', function(e) {
    console.log(e);
});
server.on('listening', function() {
    console.log('Listening on ' + server.address().port);
});
server.listen(config.port);
