const http = require('http');

module.exports.start = async function (instance) {
    console.log(`工作进程${process.pid}开始`);
    process.on('message', async function (msg) {
        console.log(`[${process.id || '?'}-${process.pid}]: 收到消息：${msg.tip}`);
        switch (msg.do) {
            case 'start':
                process.id = msg.data;
                process.sleepCount = 0;
                process.send(`好的`);
                const server = http.createServer(function (req, res) {
                    res.writeHead(200);
                    res.end(`你好，我是 ${process.id}-${process.pid} ！\n`);
                });
                server.on('close', function () {
                    console.log(`[${process.id}-${process.pid}]: 监听已停止`);
                });
                server.listen();
                process.server = server;
                break;
            case 'stop':
                console.log(`[${process.id}-${process.pid}]: 我停止监听，准备下班`);
                process.server.close();
                break;
            case 'task':
                if (msg.data) {
                    console.log(`[${process.id}-${process.pid}]: 开始任务 ${msg.data}`);
                    await instance.execTask(msg.data);
                    process.send(`任务完成了`);
                } else {
                    process.sleepCount++;
                    if (process.sleepCount > 10) {
                        process.send('我要下班')
                    } else {
                        console.log(`[${process.id}-${process.pid}]: 收到空任务，休息一会儿，第${process.sleepCount}次休息`);
                        setTimeout(function () {
                            process.send(`我休息好了`);
                        }, 1000 * 2);
                    }
                }
                break;
            default:
                process.send(`你说啥？`);
        }
    });
}