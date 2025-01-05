const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Kết nối Sequelize
const ProductsType = require('./productTypeModel'); // Nhập mô hình ProductsType

// Định nghĩa mô hình Product
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
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
    ID_products_types: {
        type: DataTypes.INTEGER,
        references: {
            model: ProductsType, // Liên kết với bảng ProductsType
            key: 'id'
        }
    },
    Price: {
        type: DataTypes.FLOAT
    },
    Tax: {
        type: DataTypes.FLOAT
    },
    status: {
        type: DataTypes.BOOLEAN
    },
    timestamp: {
        type: DataTypes.DATE
    }
}, {
    timestamps: false,
    tableName: 'products', // Đặt tên bảng là products
});

// Thiết lập quan hệ: Product thuộc về ProductsType
Product.belongsTo(ProductsType, { foreignKey: 'ID_products_types', targetKey: 'id' });

module.exports = Product;
