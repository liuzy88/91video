const co = require('co');
const cheerio = require('cheerio');

const DB = require('../db');
const Browser = require('../browser');

co(function* () {
    // 14xav.com or 10xav.com
    yield DB.use('14xav');
    Browser.setCharset('10xav.com', 'gb2312');
    for (let id = 3393; id < 50000; id++) {
        const url = `http://10xav.com/player/index${id}.html`;
        const res = yield Browser.GET(url);
        const $ = cheerio.load(res.body);
        const result = /f:'(http[^\']+.mp4)',/.exec(res.body) || ['', ''];
        if (result[1]) {
            const title = $('title').text().trim();
            const video = {id: id, url: url, title: title.substring(5), mp4: result[1]};
            console.debug('Video', JSON.stringify(video));
            yield DB.Model.replace(video);
        }
    }
}).catch((err) => {
    console.error(err);
});
