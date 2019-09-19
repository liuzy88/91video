const co = require('co');
const cheerio = require('cheerio');

const DB = require('../db');
const Browser = require('../browser');

co(function* () {
    // 668wy.com or 0154s.com
    yield DB.use('668wy');
    for (let id = 1; id < 5530; id++) {
        const url = `http://668wy.com/?m=vod-play-id-${id}-src-1-num-1.html`;
        const res = yield Browser.GET(url, {Cookie: 'PHPSESSID=uign95nav471a0c3ujcn97qi30;'});
        const $ = cheerio.load(res.body);
        const result = /unescape\('([\S\s]+)'\);/.exec(res.body) || ['', ''];
        if (result[1]) {
            const title = $('.title_all').text().trim();
            const video = {id: id, url: url, title: title, mp4: unescape(result[1])};
            console.debug('Video', JSON.stringify(video));
            yield DB.Model.replace(video);
        }
    }
}).catch((err) => {
    console.error(err);
});
