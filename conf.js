module.exports = {
    db: {
        dialect: 'sqlite',
        showSql: false,
        sqlite: {
            storage: '91video.db',
        },
        mysql: {
            host: "127.0.0.1",
            port: 3306,
            user: "gloat",
            password: "clouds",
            database: "91video",
        }
    },
    imp: {
        cacheDir: 'G:/91Cache',
    },
    exp: {
        dlDir: 'G:/91Download', // Thunder download dir
        reDir: 'G:/91Video', // rename output dir
    },
    www: {
        port: 8080,
        table: 'bka8', // the database table name
        mode: 'online', // load internet url
        // mode: 'offline', // open local disk file
    }
};