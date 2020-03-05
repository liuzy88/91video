const co = require('co');
const cheerio = require('cheerio');

const DB = require('../db');
const Comm = require('../comm');
const Browser = require('../browser');

const start = 1; // 开始数
const end = 1244; // 结束数
const threads = 16; // 开多少个窗口
let N = process.argv[2]; // 当前窗口序号
if (N === undefined) {
    for (let n = 0; n < threads; n++) {
        Comm.exec(`node ${process.argv[1]} ${n}`);
    }
    setTimeout(function () {
        process.exit();
    }, 500);
    return;
} else {
    console.log(`#${process.pid} ${JSON.stringify(process.argv)}`);
    N = parseInt(N)
}

co(function*() {
    yield DB.use('8x3a');
    for (let page = start; page <= end; page += threads) {
        const res = yield Browser.GET(`https://8dni.com/html/category/video/page_${page + N}.html`);
        const $ = cheerio.load(res.body);
        const arr = [];
        $('.l_b li').each(function() {
            const path = $(this).find('.t_p a').attr('href');
            if (path && path !== '/') {
                const url = 'https://8dni.com' + path;
                const id = path.substring(6, path.length - 1);
                const title = $(this).find('.w_z h3').text();
                const jpg = $(this).find('.t_p a img').attr('data-original');
                const video = { id: id, url: url, title: title, jpg: jpg };
                console.log(video);
                arr.push(video)
            }
        });
        for (let i in arr) {
            const video = arr[i];
            const data = yield DB.Model.findOne({where: {id: video.id}});
            if (!data || !data.mp4) {
                const res = yield Browser.GET(video.url);
                const $ = cheerio.load(res.body);
                const mp4 = $('.sp_kj .x_z a').first().attr('href');
                if (mp4 && mp4.endsWith('.mp4')) {
                    video.mp4 = mp4;
                    console.log(video);
                    yield DB.Model.replace(video)
                }
            }
        }
    }
}).catch((err) => {
    console.error(err)
});