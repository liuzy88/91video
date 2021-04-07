const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const outDir = '/Volumes/Macintosh SD';
const mmDir = path.join(outDir, 'Meizi');
const dataDir = path.join(outDir, 'Meizi-Data');
const cacheDir = path.join(outDir, 'Meizi-Cache');

const instance = {};

instance.urls = [];

// 主线程刷列表
instance.main = async () => {
    let tags = ['性感', '平面模特', '内地90后', '模特', '日本偶像', '日本模特', '内地平面模特', '中国模特', '比基尼', '正妹', '美腿',
        'showgirl', '巨乳', '台湾正妹', '妹子', '内地模特', '诱惑', 'cosplay', '清纯', '美乳', '酥胸', '台湾模特', '美国模特', '爆乳',
        '写真', '美女', '日本演员', 'Coser', '私房', 'Jkf女郎', '翘臀', '车模', '可爱', '童颜巨乳', '女神', '日本歌手', '半裸', '大尺度',
        '韩国模特', '全裸'];
    for (let i = 0; i < tags.length; i++) {
        console.debug('===>', `${i + 1}/${tags.length}`, tags[i]);
        let tag = {};
        tag.name = tags[i];
        tag.url = `http://www.177521.com/e/tags/?tagname=${encodeURIComponent(tag.name)}`;
        const cache_file = path.join(dataDir, `${tag.name}.json`);
        if (fs.existsSync(cache_file)) {
            tag = JSON.parse(fs.readFileSync(cache_file));
        } else {
            let $ = await getWeb(tag.url);
            if ($ == null) {
                return;
            }
            tag.mm = [];
            let tags = $('.update_area_lists a');
            console.debug(tag.name, '第1页', tags.length, 'tag');
            tags.each(function () {
                tag.mm.push($(this).attr('href'));
            });
            const nexts = [];
            $('.nav-links a').each(function () {
                if ($(this).text().startsWith('第')) {
                    nexts.push($(this).attr('href').replace(tag.name, encodeURIComponent(tag.name)));
                }
            });
            for (let i = 0; i < nexts.length; i++) {
                $ = await getWeb(nexts[i]);
                if ($ == null) {
                    continue;
                }
                tags = $('.update_area_lists a');
                console.debug(`${tag.name} 第${parseInt(i) + 2}页`, tags.length, 'tag');
                tags.each(function () {
                    tag.mm.push($(this).attr('href'));
                });
            }
            fs.writeFileSync(cache_file, JSON.stringify(tag, null, 2));
        }
        for (let i = 0; i < tag.mm.length; i++) {
            instance.urls.push(tag.mm[i]);
        }
    }
}

// 主线程分配任务
instance.getTask = function () {
    const url = instance.urls.shift();
    console.log(`取到了任务 ${url}`);
    return url;
}

// 子线程执行任务
instance.execTask = async function (url) {
    const id = url.split('/')[2].split('.')[0];
    if (id === 'www') {
        return;
    }
    let mm = {};
    mm.id = id;
    const cache_file = path.join(dataDir, `${id}.json`);
    if (fs.existsSync(cache_file)) {
        mm = JSON.parse(fs.readFileSync(cache_file));
        console.debug(mm.id, mm.name);
    } else {
        mm.url = `http://www.177521.com` + url;
        let $ = await getWeb(mm.url);
        if ($ == null) {
            return;
        }
        mm.name = $('title').text().split('--177521')[0].split('-177521')[0].replaceAll('/', '_');
        mm.img = [];
        console.debug(mm.id, mm.name);
        let imgs = $('.content_left img');
        if (imgs.length > 0) {
            console.debug(`${mm.id} 第1页`, imgs.length, 'img');
            imgs.each(function () {
                mm.img.push($(this).attr('src'));
            });
        }
        imgs = $('.image_div img');
        if (imgs.length > 0) {
            console.debug(mm.id, '第1页', imgs.length, 'img');
            imgs.each(function () {
                mm.img.push($(this).attr('src'));
            });
            let nexts = [];
            $('.page_imges a').each(function () {
                if ($(this).text().startsWith('第')) {
                    nexts.push($(this).attr('href'));
                }
            });
            for (let i = 0; i < nexts.length; i++) {
                $ = await getWeb(nexts[i]);
                if ($ == null) {
                    continue;
                }
                imgs = $('.image_div img');
                console.debug(`${mm.id} 第${parseInt(i) + 2}页`, imgs.length, 'img');
                imgs.each(function () {
                    mm.img.push($(this).attr('src'));
                });
            }
        }
        fs.writeFileSync(cache_file, JSON.stringify(mm, null, 2));
    }
    if (mm.img.length > 0) {
        mm.name = mm.name.replaceAll('/', '_');
        for (let i = 0; i < mm.img.length; i++) {
            if (typeof mm.img[i] === 'string') {
                const name = path.basename(mm.img[i]);
                const newId = (Array(5).join('0') + mm.id).slice(-5);
                const idx = (Array(3).join('0') + (i + 1)).slice(-3)
                const newName = `${newId}-${idx}${path.extname(name)}`;
                const dst = path.join(mmDir, newName);
                if (!fs.existsSync(dst)) {
                    console.log('mmDir =>', dst);
                    await getImg(mm, i, dst);
                }
            }
        }
    }
}

function opts(url) {
    return {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Cookie': 'Hm_lvt_b96fe021352b520f1524a6deb63c9bc8=1617280098,1617295170,1617298156,1617636064',
            'Host': url.split('/')[2],
            'Pragma': 'no-cache',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        }
    }
}

// 下载网页
async function getWeb(url) {
    try {
        if (url.startsWith('/')) {
            url = 'http://www.177521.com' + url;
        }
        let cache_url = url.split('://')[1].replaceAll('/', '_');
        let cache_file = path.join(cacheDir, cache_url);
        let body;
        if (fs.existsSync(cache_file)) {
            body = fs.readFileSync(cache_file);
        } else {
            console.debug('--->', url);
            body = await fetch(url, opts(url)).then(res => res.text());
        }
        if (body && body.length > 100) {
            fs.writeFileSync(cache_file, body);
            return cheerio.load(body);
        }
    } catch (e) {
        console.error(e.message);
    }
    return null;
}

// 下载图片
async function getImg(mm, i, dst) {
    try {
        let url = mm.img[i];
        if (url.startsWith('/')) {
            url = 'http://www.177521.com' + url;
        }
        await fetch(url, opts(url)).then(res => {
            if (res.headers.get('content-type') === 'text/html') {
                console.error('下载失败，返回的是text/html', url);
            } else {
                res.body.pipe(fs.createWriteStream(dst));
                console.log(mm.id, 'save', url, 'success');
            }
        });
    } catch (e) {
        console.error(e.message);
    }
}

module.exports = instance;