const os = require('os');
const cluster = require('cluster');
const cupNums = os.cpus().length;

module.exports.start = async function(instance) {
    console.log(`主进程${process.pid}开始`);
    for (let i = 0; i < cupNums; i++) {
        let worker = cluster.fork();
        worker.send({
            do: 'start',
            tip: `工人${worker.id}号，开始工作吧`,
            data: worker.id,
        });
    }
    cluster.on('message', function(worker, message) {
        console.log(`[0-${process.pid}]: 收到[${worker.id}-${worker.process.pid}]的消息：`, message);
        if (message === '我要下班') {
            console.log(`[0-${process.pid}]: 让[${worker.id}-${worker.process.pid}]下班`);
            worker.send({
                do: 'stop',
                tip: `你下班吧，给你1秒钟消失`,
            });
            setTimeout(function() {
                console.log(`[0-${process.pid}]: 断开与[${worker.id}-${worker.process.pid}]的IPC管道`);
                worker.disconnect(); // 主动断开IPC管道
            }, 1000);
        } else {
            console.log(`[0-${process.pid}]: 给[${worker.id}-${worker.process.pid}]派发一个任务`);
            worker.send({
                do: 'task',
                tip: '起来干活',
                data: instance.getTask(),
            });
        }
    });
    cluster.on('online', function(worker) {
        console.log(`[0-${process.pid}]: 启动[${worker.id}-${worker.process.pid}]`);
    });
    cluster.on('listening', function(worker, address) {
        console.log(`[0-${process.pid}]: [${worker.id}-${worker.process.pid}]正在监听 ${address.address || '*'}:${address.port}`);
    });
    cluster.on('disconnect', (worker) => {
        console.log(`[0-${process.pid}]: [${worker.id}-${worker.process.pid}]IPC管道已断开`);
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log(`[0-${process.pid}]: [${worker.id}-${worker.process.pid}]已停止，退出码=${code} 信号=${signal}`);
        if (worker.exitedAfterDisconnect === true) {
            console.log(`[0-${process.pid}]: 这是主线程主动断开的，无需重启。`);
        } else {
            console.log(`[0-${process.pid}]: 启动一个新的工作进程`);
            let worker = cluster.fork();
            worker.send({
                do: 'start',
                tip: `工人${worker.id}号，接替${worker.id}-${worker.process.pid}的工作吧`,
                data: worker.id,
            });
        }
    });
    await instance.main();
}

// 主线程异常，全部退出
module.exports.stop = function () {
    for (let id in cluster.workers) {
        let worker = cluster.workers[id];
        worker.send({
            do: 'stop',
            tip: `工厂倒闭了，工人${id}号，立刻下班，给你1秒钟消失`
        });
        setTimeout(function() {
            console.log(`[0-${process.pid}]: 断开与[${worker.id}-${worker.process.pid}]的IPC管道`);
            worker.disconnect(); // 主动断开IPC管道
        }, 1000);
    }
}