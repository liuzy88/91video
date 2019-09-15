var product = {
    port: '2000',
    ips: [
        '211.161.242.54',
        '211.161.245.54',
        '127.0.0.1',
    ],
    db: {
        host: "rdsek2544l3699q650sdo.mysql.rds.aliyuncs.com",
        port: 3306,
        user: "liuzy",
        password: "111111",
        database: "liuzy"
    }
}

var develop = {
    port: '2000',
    ips: [
        '127.0.0.1'
    ],
    db: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "",
        database: "test"
    }
}

module.exports = product;
// module.exports = develop;
