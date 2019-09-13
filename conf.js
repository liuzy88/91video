module.exports = {
    db: {
        dialect: 'sqlite',
        showSql: true,
        sqlite: {
            storage: '91video.db',
            database: "test",
        },
        mysql: {
            host: "127.0.0.1",
            port: 3306,
            user: "gloat",
            password: "clouds",
            database: "test",
        }
    },
    imp: {
        cacheDir: 'E:/91Cache',
    },
    exp: {
        dlDir: 'E:/91Download', // Thunder download dir
        reDir: 'E:/91Video', // rename output dir
    },
    www: {
        port: 8080,
        // mode: 'online', // load internet url
        mode: 'offline', // open local disk file
    }
};