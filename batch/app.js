const cluster = require('cluster');
// 主程序
const Master = require('./master');
const Worker = require('./worker');
// 爬虫实例
const instance = require('./instance');

(async () => {
    if (cluster.isMaster) {
        try {
            await Master.start(instance);
        } catch (e) {
            console.error(e);
            Master.stop();
        }
    } else {
        Worker.start(instance);
    }
})().catch(err => console.error(err));
