const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Product = require('./productModel');

const ProductsType = sequelize.define('ProductsType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    Descriptions: { type: DataTypes.STRING },
    content: { type: DataTypes.STRING },
    thumb: { type: DataTypes.STRING },
    slug: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    timestamp: { type: DataTypes.DATE },
}, {
    timestamps: false,
    tableName: 'products_type',
});

// ProductsType.hasMany(Product, { foreignKey: 'ID_products_types', as: 'products' });

module.exports = ProductsType;
