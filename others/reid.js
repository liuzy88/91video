const co = require('co');
const Sequelize = require('sequelize');

co(function* () {
    const sequelize = new Sequelize('test', 'root', '111111', {
        dialect: 'mysql',
        logging: false,
        timezone: '+08:00',
        dialectOptions: {charset: "utf8",},
        pool: {min: 0, max: 5, acquire: 30000, idle: 10000},
    });
    const video = sequelize.define('video', {
        id: {type: Sequelize.INTEGER(11), autoIncrement: true, primaryKey: true},
        title: Sequelize.STRING(128),
        mp4: Sequelize.STRING(1024),
        saved: Sequelize.INTEGER(1),
    }, {
        tableName: 'video',
        timestamps: false,
        charset: 'utf8',
    });
    yield video.sync({force: true});
    for (let i = 0; i < 17999; i++) {
        const sql = `SELECT * FROM videos order by SUBSTR(mp4, 1, LENGTH(mp4) - LOCATE('/', REVERSE(mp4))+1), \`name\` LIMIT ${i}, 1`;
        const data = yield sequelize.query(sql, {
            type: sequelize.QueryTypes.SELECT,
        });
        if (data.length === 0) {
            break;
        }
        yield sequelize.query(`insert into video(title,mp4,saved) value(?,?,?)`, {
            replacements: [data[0].name, data[0].mp4, data[0].saved],
        });
    }
}).catch((err) => {
    console.log(err);
});