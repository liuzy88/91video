const co = require('co');
const cheerio = require('cheerio');

const DB = require('../db');
const Browser = require('../browser');

const mode = 0;

co(function* () {
    yield DB.use('caobi45');
    Browser.setCharset('www.caobi45.com', 'gb2312');
    if (mode >= 0) {
        /* climb play page, get videos */
        for (let id = 1688; id < 50000; id++) {
            const url = `http://www.caobi45.com/player/index${id}.html`;
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
    }
    if (mode <= 0) {
        /* climb list page, update preview jpg */
        const list = [];
        add(list, 'http://www.caobi45.com/index.html');
        add(list, 'http://www.caobi45.com/list/index27.html', 117);
        add(list, 'http://www.caobi45.com/list/index28.html', 279);
        add(list, 'http://www.caobi45.com/list/index29.html', 27);
        add(list, 'http://www.caobi45.com/list/index34.html', 111);
        add(list, 'http://www.caobi45.com/list/index54.html', 147);
        add(list, 'http://www.caobi45.com/list/index55.html', 444);
        add(list, 'http://www.caobi45.com/list/index56.html', 38);
        add(list, 'http://www.caobi45.com/list/index57.html', 1354);
        for (let i = 0; i < list.length; i++) {
            const res = yield Browser.GET(list[i]);
            const $ = cheerio.load(res.body);
            const array = $('a.pic').map(function () {
                const href = $(this).attr('href');
                const id = href.substring(11, href.length - 5);
                const jpg = $(this).find('img').attr('src');
                return {id: id, jpg: jpg};
            });
            for (let j = 0; j < array.length; j++) {
                const video = array[j];
                console.debug('Image', JSON.stringify(video));
                if (video.id && video.jpg) {
                    yield DB.Model.update({jpg: video.jpg}, {where: {id: video.id}});
                }
            }
        }
    }
}).catch((err) => {
    console.error(err);
});

function add(list, url, count) {
    for (let i = 0; i < count + 10; i++) {
        list.push(i === 0 ? url : url.replace('.html', '') + '_' + i + '.html');
    }
}