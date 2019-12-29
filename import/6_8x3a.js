const co = require('co')
const cheerio = require('cheerio')

const DB = require('../db')
const Browser = require('../browser')

const mode = 0

co(function*() {
    yield DB.use('8x3a')
    for (let page = 1; page < 1202; page++) {
        let res = yield Browser.GET(`https://8x3a.com/html/category/video/page_${page}.html`)
        let $ = cheerio.load(res.body)
        let arr = []
        $('.l_b li').each(function() {
            const path = $(this).find('.t_p a').attr('href')
            if (path !== '/') {
                let url = 'https://8x3a.com' + path
                let id = path.substring(6, path.length - 1)
                let title = $(this).find('.w_z h3').text()
                let jpg = $(this).find('.t_p a img').attr('data-original')
                let video = { id: id, url: url, title: title, jpg: jpg }
                console.log(video)
                arr.push(video)
            }
        })
        for (i in arr) {
            let video = arr[i]
            let res = yield Browser.GET(video.url)
            let $ = cheerio.load(res.body)
            let mp4 = $('.sp_kj .x_z a').attr('href')
            console.log(mp4)
            video.mp4 = mp4
            yield DB.Model.replace(video)
        }
    }
}).catch((err) => {
    console.error(err)
})