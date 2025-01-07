const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const ProductsType = require('./productTypeModel');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    Descriptions: { type: DataTypes.STRING },
    content: { type: DataTypes.STRING },
    thumb: { type: DataTypes.STRING },
    slug: { type: DataTypes.STRING },
    ID_products_types: { type: DataTypes.INTEGER },
    Price: { type: DataTypes.FLOAT },
    Tax: { type: DataTypes.FLOAT },
    status: { type: DataTypes.BOOLEAN },
    timestamp: { type: DataTypes.DATE },
}, {
    timestamps: false,
    tableName: 'products',
});

// Product.belongsTo(ProductsType, { foreignKey: 'ID_products_types', as: 'productType' });

module.exports = Product;
