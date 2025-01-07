const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
    UserName: { type: DataTypes.STRING, allowNull: false },
    Pass: { type: DataTypes.STRING, allowNull: false },
    Email: { type: DataTypes.STRING, allowNull: false },
    PhoneNumber: { type: DataTypes.STRING },
    Wallet: { type: DataTypes.FLOAT },
    Credit: { type: DataTypes.FLOAT },
    Address: { type: DataTypes.STRING },
    Token: { type: DataTypes.STRING },
    VIPuser: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    timestamp: { type: DataTypes.DATE },
}, { timestamps: false });

module.exports = User;
