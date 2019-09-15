const co = require('co');
const cheerio = require('cheerio');

const DB = require('../db');
const Browser = require('../browser');

co(function* () {
    yield DB.use('bka8');
    for (let id = 2273; id < 8298; id++) {
        const url = `http://www.bka8.com/?m=vod-play-id-${id}-src-1-num-1.html`;
        const res = yield Browser.GET(url, {Cookie: 'PHPSESSID=p5r2tp0mcra0pfu0aok07rcec7;'});
        const $ = cheerio.load(res.body);
        const result = /unescape\(([\S\s]+)'\);/.exec(res.body) || ['', ''];
        if (result[1]) {
            const title = $('.position').find('a').last().text().trim();
            const video = {id: id, url: url, title: title, mp4: unescape(result[1])};
            console.debug('Video', JSON.stringify(video));
            yield DB.Model.replace(video);
        }
    }
}).catch((err) => {
    console.error(err);
});
