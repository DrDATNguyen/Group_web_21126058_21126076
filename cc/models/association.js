const Product = require('./productModel'); // Nhập mô hình Product
const ProductsType = require('./productTypeModel'); // Nhập mô hình ProductsType

// Thiết lập quan hệ giữa Product và ProductsType
ProductsType.hasMany(Product, { foreignKey: 'ID_products_types', sourceKey: 'id' });
Product.belongsTo(ProductsType, { foreignKey: 'ID_products_types', targetKey: 'id' });

module.exports = { Product, ProductsType };
