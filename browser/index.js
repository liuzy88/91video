const co = require('co');
const URL = require('url');
const zlib = require('zlib');
const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');
const querystring = require('querystring');

const ua = require('./ua');
const cache = require('./cache');
const Cookie = require('./cookie');

const hostname_charset = {};

module.exports.setCharset = function (hostname, charset) {
    hostname_charset[hostname] = charset;
};

module.exports.GET = function (url, headers) {
    return request('GET', url, headers);
};

module.exports.POST = function (url, headers, form) {
    return request('POST', url, headers, form);
};

function request(method, url, headers, form) {
    console.log(`Browser ${method} ${url}`);
    return function (cb) {
        headers = headers || {};
        form = form || {};
        const postData = querystring.stringify(form);
        const options = URL.parse(url);
        options.method = method;
        options.headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': ua(),
        };
        if (method === 'POST') {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.headers['Content-Length'] = postData.length;
        }
        for (let k in headers) {
            options.headers[k] = headers[k];
        }
        const html = cache.read(options);
        if (html) {
            const ret = {code: 304, headers: options.headers, body: html};
            cb(null, ret);
            return;
        }
        Cookie.append(options.headers);
        const agent = options.protocol === 'https:' ? https : http;
        const req = agent.request(options, (res) => {
            res.setTimeout(3000);
            const data = [];
            res.on('data', (chunk) => {
                data.push(chunk);
            });
            res.on('end', () => {
                co(function* () {
                    let buff;
                    if (res.headers['content-encoding'] === 'gzip') { // Gzip supper
                        buff = yield gzip(Buffer.concat(data));
                    } else {
                        buff = Buffer.concat(data);
                    }
                    const charset = hostname_charset[options.hostname];
                    if (charset) {
                        buff = iconv.decode(buff, charset);
                    }
                    const body = buff.toString();
                    if (body.length > 500) {
                        cache.write(options, body);
                    }
                    Cookie.remember(options, res.headers);
                    const ret = {code: res.statusCode, headers: res.headers, body: body};
                    cb(null, ret);
                }).catch((err) => {
                    console.log('Browser err', err);
                    const ret = {code: 500, headers: {}, body: '<html></html>'};
                    cb(null, ret);
                });
            })
        });
        req.setTimeout(3000);
        req.on('error', (err) => {
            console.log('Browser err', err);
            const ret = {code: 500, headers: {}, body: '<html></html>'};
            cb(null, ret);
        });
        if (method !== 'GET') {
            req.write(postData)
        }
        req.end();
    }
}

function gzip(data) {
    return function (cb) {
        zlib.gunzip(data, function (err, decoded) {
            cb(err, decoded);
        });
    }
}
