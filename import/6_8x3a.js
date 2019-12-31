const co = require('co')
const cheerio = require('cheerio')
const exec = require('child_process').exec

const DB = require('../db')
const Browser = require('../browser')

const start = 1 // 开始数
const end = 1233 // 结束数
const threads = 16 // 开多少个窗口
var N = process.argv[2] // 当前窗口序号

if (N === undefined) {
    for (let n = 0; n < threads; n++) {
        exec(`start cmd /c node ${process.argv[1]} ${n}`, function(err, stdout, errout) {})
    }
    return
} else {
    N = parseInt(N)
}

co(function*() {
    yield DB.use('8x3a')
    for (let page = start; page <= end; page += threads) {
        const res = yield Browser.GET(`https://8x9l.com/html/category/video/page_${page + N}.html`)
        const $ = cheerio.load(res.body)
        const arr = []
        $('.l_b li').each(function() {
            const path = $(this).find('.t_p a').attr('href')
            if (path !== '/') {
                const url = 'https://8x9l.com' + path
                const id = path.substring(6, path.length - 1)
                const title = $(this).find('.w_z h3').text()
                const jpg = $(this).find('.t_p a img').attr('data-original')
                const video = { id: id, url: url, title: title, jpg: jpg }
                console.log(video)
                arr.push(video)
            }
        })
        for (i in arr) {
            const video = arr[i]
            const res = yield Browser.GET(video.url)
            const $ = cheerio.load(res.body)
            const mp4 = $('.sp_kj .x_z a').first().attr('href')
            if (mp4) {
                video.mp4 = mp4
                console.log(video)
                yield DB.Model.replace(video)
            }
        }
    }
}).catch((err) => {
    console.error(err)
})