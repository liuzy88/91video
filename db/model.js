const Sequelize = require('sequelize');

module.exports = {
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
    mp4: {
        type: Sequelize.STRING(128),
        allowNull: true,
        comment: '视频',
    },
    jpg: {
        type: Sequelize.STRING(128),
        allowNull: true,
        comment: '图片',
    },
    saved: {
        type: Sequelize.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        comment: '是否已硬存',
    },
};