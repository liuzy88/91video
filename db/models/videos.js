const Sequelize = require('sequelize');
const driver = require('../driver');

const Videos = driver.define('videos', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    url: {
        type: Sequelize.STRING(128),
        allowNull: true,
        comment: '地址',
    },
    title: {
        type: Sequelize.STRING(128),
        allowNull: true,
        comment: '标题',
    },
    jpg: {
        type: Sequelize.STRING(128),
        allowNull: true,
        comment: '图片',
    },
    mp4: {
        type: Sequelize.STRING(128),
        allowNull: true,
        comment: '视频',
    },
    state: {
        type: Sequelize.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        comment: '状态：0正常 1正在处理',
    },
    saved: {
        type: Sequelize.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        comment: '是否已硬存',
    },
}, {
    // options
});

module.exports = Videos;