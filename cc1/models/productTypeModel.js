const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Kết nối Sequelize
const Product = require('./productModel'); // Nhập mô hình Product

// Định nghĩa mô hình ProductsType
const ProductsType = sequelize.define('ProductsType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    Descriptions: {
        type: DataTypes.STRING
    },
    content: {
        type: DataTypes.STRING
    },
    thumb: {
        type: DataTypes.STRING
    },
    slug: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.BOOLEAN
    },
    timestamp: {
        type: DataTypes.DATE
    }
}, {
    timestamps: false,
    tableName: 'products_type', // Đặt tên bảng là products_type
});

// Thiết lập quan hệ: ProductsType có nhiều Product
// ProductsType.hasMany(Product, { foreignKey: 'ID_products_types', sourceKey: 'id' });

module.exports = ProductsType;
