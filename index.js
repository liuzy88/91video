const co = require('co');
const http = require('http');
const path = require('path');
const express = require('express');

const DB = require('./db');
const Conf = require('./conf');
const Comm = require('./comm');

const app = express();
app.set('views', path.join(__dirname, 'www'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res, next) => {
    co(function* () {
        const id = req.query.id;
        if (id > 0) {
            const data = yield DB.Model.findOne({where: {id: id}});
            if (Conf.www.mode === 'offline') {
                const flag = yield Comm.openVideo(Conf.exp, data);
                res.end(flag ? 'Play failure.' : '<script>window.close()</script>')
            } else {
                res.render('index', {data: data});
            }
        } else {
            const page = parseInt(req.query.page) || 1;
            const rows = parseInt(req.query.rows) || 48;
            const data = yield DB.Model.findAndCountAll({
                where: Conf.www.mode === 'offline' ? {saved: 1} : {},
                order: ['id'],
                limit: rows,
                offset: (page - 1) * rows,
            });
            res.render('index', {page: page, rows: rows, data: data, len: data.rows.length});
        }
    }).catch((err) => {
        next(err);
    });
});

app.use((req, res, next) => {
    res.status(404).send('404 is Fuck')
});
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('500 Server Error')
});
const server = http.createServer(app);
server.on('error', (err) => {
    console.log(err);
});
server.on('listening', () => {
    co(function* () {
        yield DB.use(Conf.www.table);
        console.log(`Web start http://localhost:${server.address().port}/`);
    }).catch((err) => {
        console.log(err);
    });
});
server.listen(Conf.www.port);