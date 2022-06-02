const { DataTypes } = require('sequelize');

const { db } = require('../utils/database');

const ImgPath = db.define('imgPath', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
        type: DataTypes.INTEGER,
    },
    imgPathUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ImgId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
    },

    status: {
        type: DataTypes.STRING,
        defaultValue: 'available',
    },
});

module.exports = { ImgPath };
