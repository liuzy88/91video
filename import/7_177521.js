const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const outDir = '/Users/liuzy/Pictures/';
const tagDir = path.join(outDir, '分类');
const dataDir = path.join(outDir, '数据');
const cacheDir = path.join(outDir, '缓存');

(async () => {
    Array.prototype.shuffle = function () {
        let m = this.length, i;
        while (m) {
            i = (Math.random() * m--) >>> 0;
            [this[m], this[i]] = [this[i], this[m]]
        }
        return this;
    }
    let tags = ['性感', '平面模特', '内地90后', '模特', '日本偶像', '日本模特', '内地平面模特', '中国模特', '比基尼', '正妹', '美腿',
        'showgirl', '巨乳', '台湾正妹', '妹子', '内地模特', '诱惑', 'cosplay', '清纯', '美乳', '酥胸', '台湾模特', '美国模特', '爆乳',
        '写真', '美女', '日本演员', 'Coser', '私房', 'Jkf女郎', '翘臀', '车模', '可爱', '童颜巨乳', '女神', '日本歌手', '半裸', '大尺度',
        '韩国模特', '全裸'].shuffle().shuffle(); //
    for (let i = 0; i < tags.length; i++) {
        await scanTag(tags[i], true);
    }
})().catch(err => console.log(err));

async function scanTag(name, cao) {
    console.debug('===>', name);
    let tag = {};
    tag.name = name;
    tag.url = `http://www.177521.com/e/tags/?tagname=${encodeURIComponent(tag.name)}`;
    tag.cache = path.join(tagDir, `${tag.name}.json`);
    if (fs.existsSync(tag.cache)) {
        tag = JSON.parse(fs.readFileSync(tag.cache));
    } else {
        console.debug(tag.name, '第1页', tag.url);
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
        fs.writeFileSync(tag.cache, JSON.stringify(tag, null, 2));
    }
    if (cao) {
        for (let i = 0; i < tag.mm.length; i++) {
            const arr = tag.mm[i].split('/');
            await scanGirl(arr[1], arr[2].split('.')[0], true);
        }
    }
}

async function scanGirl(type, id, gan) {
    if (id === 'www') {
        return;
    }
    let mm = {};
    mm.id = id;
    mm.cache = path.join(dataDir, `${id}.json`);
    if (fs.existsSync(mm.cache)) {
        mm = JSON.parse(fs.readFileSync(mm.cache));
    } else {
        let url = `http://www.177521.com/${type}/${id}.html`;
        let $ = await getWeb(url);
        if ($ == null) {
            return;
        }
        mm.type = type;
        mm.url = url;
        mm.name = $('title').text().split('--177521')[0];
        mm.name = mm.name.split('-177521')[0];
        mm.name = mm.name.replaceAll('/', '_');
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
        fs.writeFileSync(mm.cache, JSON.stringify(mm, null, 2));
    }
    if (gan && mm.img.length > 0) {
        await getImgs(mm);
    }
}

async function getImgs(mm) {
    mm.name = mm.name.replaceAll('/', '_');
    const dir = path.join(outDir, `${mm.id}-${mm.name}`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    for (let i = 0; i < mm.img.length; i++) {
        if (typeof mm.img[i] === 'string') {
            const name = path.basename(mm.img[i]);
            const dst = path.join(dir, name);
            if (!fs.existsSync(dst)) {
                await getImg(mm, i, dst);
            }
        }
    }
}

const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Cookie': 'ypwfqcheckplkey=1617292918%2C10bedd70e236923ab2862f77f640fe8d%2CEmpireCMS',
    'Host': 'www.177521.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
};

async function getImg(mm, i, dst) {
    try {
        let url = mm.img[i];
        if (url.startsWith('/')) {
            url = 'http://www.177521.com' + url;
        }
        await fetch(url, {headers: headers}).then(res => {
            res.body.pipe(fs.createWriteStream(dst));
            console.log(mm.id, 'save', url, 'success');
        });
    } catch (e) {
        console.error(e.message);
    }
}

async function getWeb(url) {
    try {
        if (url.startsWith('/')) {
            url = 'http://www.177521.com' + url;
        }
        console.debug('--->', url);
        let cache_url = url.split('://')[1].replaceAll('/', '_');
        let cache_file = path.join(cacheDir, cache_url);
        let body;
        if (fs.existsSync(cache_file)) {
            body = fs.readFileSync(cache_file);
        } else {
            body = await fetch(url, {headers: headers}).then(res => res.text());
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