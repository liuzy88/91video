var request = require("request");
var iconv = require('iconv-lite');
var crypto = require('crypto');
var DB = require('../db/db');
var Logger = require('./logger');

function saveMp4(mp4) {
    // Logger.log(mp4.hash, mp4.name, mp4.img, mp4.mp4);
    DB.Videos.findbyHash({
        hash: mp4.hash
    }).then(function(data) {
        if (data.length == 0) {
            return DB.Videos.insert(mp4);
        } else {
            return DB.Videos.update(mp4);
        }
    }).catch(function(err) {
        console.log(err);
    });
}

function Worm(params) {
    var paths = []; // 链接队列
    var history = { path: {}, img: {}, name: {} }; // 处理历史
    var worked = { done: 0, okayed: 0, failed: 0 }; // 处理状态
    var workCount = params.workCount; // 工作个数
    var works = []; // 工作队列
    // 初始化工作队列
    for (var i = 1; i <= workCount; i++) {
        works.push('work' + i);
    }
    var charset = params.charset || 'utf8';
    var timeout = params.timeout;
    // 初始化链接队列
    Logger.log('Worm init ...');
    paths = params.init.call(this);
    Logger.log('PathCount:' + paths.length);
    Logger.log('WorkCount:' + works.length);
    Logger.log('TimeOut:' + timeout);
    Logger.log('CharSet:' + charset);
    // 开始爬
    Logger.log('Worm start ...');

    function climb() {
        var work = works.shift();
        if (work) {
            var path = paths.shift();
            if (path) {
                var hash = crypto.createHash('md5').update(path).digest('hex');
                if (history.path[hash] === true) {
                    works.push(work);
                } else {
                    Logger.log(work, '-->', path);
                    history.path[hash] = true;
                    var j = request.jar();
                    if (path.indexOf('chinaporn') > 0) {
                        j.setCookie(request.cookie('honey=1; id=' + path.replace(/[^0-9]+/g, '') + ';'), path);
                    }
                    request.get(path, { jar: j, timeout: timeout }).on('error', function(err) {
                        Logger.log(work, 'error', path, err);
                        works.push(work);
                        worked.failed++;
                    }).pipe(iconv.decodeStream(params.charset)).collect(function(err, data) {
                        if (err) {
                            Logger.log(work, 'failed', path);
                            history.path[hash] = false;
                            works.push(work);
                            worked.failed++;
                        } else {
                            Logger.log(work, data.length, '<--', path);

                            var urls = params.matchData.call(this, history, path, data);
                            urls.map(function(url) { paths.push(url); });

                            var mp4s = params.matchMp4.call(this, history, path, data);
                            mp4s.map(function(mp4) { saveMp4(mp4); });

                            Logger.log(work, 'url=' + urls.length, 'mp4=' + mp4s.length, '<--', path);
                            history.path[hash] = true;
                            works.push(work);
                            worked.okayed++;
                        }
                    });
                    worked.done++;
                }
            } else {
                works.push(work);
            }
        }
        if (paths.length == 0 && works.length == workCount) {
            Logger.log(worked.done, 'complete,', worked.okayed, 'success,', worked.failed, 'failed,');
            Logger.log('Worm end.');
            process.exit(0);
        } else {
            setTimeout(climb, 20);
        }
    }
    this.climb = climb;
    return this;
}

module.exports = Worm;
