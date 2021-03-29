const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const outDir = '/Users/liuzy/Pictures/';

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
        '韩国模特', '全裸'].shuffle().shuffle();
    for (let i = 0; i < tags.length; i++) {
        await look(tags[i], true);
    }
})().catch(err => console.log(err));

async function get(url) {
    console.debug(url);
    try {
        if (url.startsWith('/')) {
            url = 'http://www.177521.com' + url;
        }
        let body = await fetch(url).then(res => res.text());
        return cheerio.load(body);
    } catch (e) {
        return cheerio.load('');
    }
}

async function look(name, cao) {
    let tag = {};
    tag.name = name;
    tag.url = `http://www.177521.com/e/tags/?tagname=${encodeURIComponent(tag.name)}`;
    tag.cache = path.join(outDir, '分类', `${tag.name}.json`);
    if (fs.existsSync(tag.cache)) {
        tag = JSON.parse(fs.readFileSync(tag.cache));
    } else {
        let $ = await get(tag.url);
        tag.mm = [];
        $('.update_area_lists a').each(function () {
            let url = $(this).attr('href');
            tag.mm.push(url);
            console.debug(`${tag.name} 第1页`, url);
        });
        const nexts = [];
        $('.nav-links a').each(function () {
            if ($(this).text().startsWith('第')) {
                nexts.push($(this).attr('href').replace(tag.name, encodeURIComponent(tag.name)));
            }
        });
        for (let i = 0; i < nexts.length; i++) {
            if (parseInt(i) > 0) {
                console.debug(`${tag.name} 第${parseInt(i) + 2}页`, nexts[i]);
                $ = await get(nexts[i]);
                $('.update_area_lists a').each(function () {
                    tag.mm.push($(this).attr('href'));
                });
            }
        }
        fs.writeFileSync(tag.cache, JSON.stringify(tag, null, 2));
    }
    if (cao) {
        for (let i = 0; i < tag.mm.length; i++) {
            const arr = tag.mm[i].split('/');
            await fuck(arr[1], arr[2].split('.')[0], true);
        }
    }
}

async function fuck(type, id, gan) {
    let mm = {};
    mm.id = id;
    mm.cache = path.join(outDir, `${id}.json`);
    if (fs.existsSync(mm.cache)) {
        mm = JSON.parse(fs.readFileSync(mm.cache));
    } else {
        let url = `http://www.177521.com/${type}/${id}.html`;
        console.debug('妹子', url);
        let $ = await get(url);
        mm.type = type;
        mm.url = url;
        mm.name = $('title').text().split('--177521')[0];
        mm.img = [];
        $('.image_div img').each(function () {
            console.debug(`${mm.id} 第1页`, $(this).attr('src'));
            mm.img.push($(this).attr('src'));
        });
        let nexts = [];
        $('.page_imges a').each(function () {
            if ($(this).text().startsWith('第')) {
                nexts.push($(this).attr('href'));
            }
        });
        for (let i = 0; i < nexts.length; i++) {
            if (parseInt(i) > 0) {
                console.debug(`${mm.id} 第${parseInt(i) + 2}页`, nexts[i]);
                $ = await get(nexts[i]);
                $('.image_div img').each(function () {
                    mm.img.push($(this).attr('src'));
                });
            }
        }
        fs.writeFileSync(mm.cache, JSON.stringify(mm, null, 2));
    }
    if (gan && mm.img.length > 0) {
        await save(mm);
    }
}

async function save(mm) {
    const dir = path.join(outDir, `${mm.id}-${mm.name}`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    for (let i = 0; i < mm.img.length; i++) {
        if (typeof mm.img[i] === 'string') {
            if (mm.img[i].startsWith('/')) {
                mm.img[i] = 'http://www.177521.com' + mm.img[i];
            }
            console.debug(mm.id, 'save', mm.img[i]);
            const name = path.basename(mm.img[i]);
            const dst = path.join(dir, name);
            if (!fs.existsSync(dst)) {
                await fetch(mm.img[i]).then(res => res.buffer()).then(data => {
                    fs.writeFile(dst, data, function (err) {
                        console.log(err || 'successfully');
                    });
                });
            }
        }
    }
}