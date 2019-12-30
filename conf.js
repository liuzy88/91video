module.exports = {
    db: {
        dialect: 'sqlite',
        showSql: false,
        database: "91video",
        sqlite: {
            storage: '91video.db',
        },
        mysql: {
            host: "127.0.0.1",
            port: 3306,
            user: "root",
            password: "123456",
        }
    },
    imp: {
        cacheDir: 'F:/91Cache',
    },
    exp: {
        dlDir: 'F:/91Download', // Thunder download dir
        reDir: 'F:/91Video', // rename output dir
    },
    www: {
        port: 8080,
        table: '8x3a', // the database table name
        mode: 'online', // load internet url
        // mode: 'offline', // open local disk file
    }
};