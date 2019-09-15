const co = require('co');
const cheerio = require('cheerio');

const DB = require('../db');
const Browser = require('../browser');

co(function* () {
    yield DB.use('0154s');
    for (let id = 1; id < 5530; id++) {
        const url = `http://0154s.com/?m=vod-play-id-${id}-src-1-num-1.html`;
        const res = yield Browser.GET(url, {Cookie: 'PHPSESSID=5995i0oabujednivrlnn91mli2;'});
        const $ = cheerio.load(res.body);
        const result = /unescape\(([\S\s]+)'\);/.exec(res.body) || ['', ''];
        if (result[1]) {
            const title = $('.k_lujing-2').text().trim();
            const video = {id: id, url: url, title: title, mp4: unescape(result[1])};
            console.debug('Video', JSON.stringify(video));
            yield DB.Model.replace(video);
        }
    }
}).catch((err) => {
    console.error(err);
});
