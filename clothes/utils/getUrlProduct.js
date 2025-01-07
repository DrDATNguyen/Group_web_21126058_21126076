const Category = require("../models/Category");
const utils = require("../utils/mongoose");

module.exports = {
  async AddUrlProduct(products) {
    let listProductWithUrl = [];
    
    // Duyệt qua từng sản phẩm
    for (const product of products) {
      // Kiểm tra nếu product là null hoặc không có tên hoặc category
      if (!product || !product.name || !product.category || !product.idProduct) {
        console.warn(`Invalid product data found:`, product);
        continue; // Bỏ qua sản phẩm không hợp lệ
      }
      
      try {
        // Lấy danh mục của sản phẩm từ cơ sở dữ liệu
        let category = await Category.findOne({ name: product.category });
        
        // Kiểm tra nếu không tìm thấy danh mục
        if (!category) {
          console.warn(`Category not found for product: ${product.name} (category: ${product.category})`);
          continue; // Nếu không tìm thấy, bỏ qua sản phẩm này
        }

        // Nếu tìm thấy category, tạo URL cho sản phẩm
        let tmp = utils.mongooseToObject(product);
        tmp.url = `${category.idCategory}/${product.idProduct}`;
        
        // Thêm sản phẩm vào danh sách
        listProductWithUrl.push(tmp);
      } catch (error) {
        console.error(`Error processing product ${product ? product.name : 'unknown'}:`, error);
      }
    }

    return listProductWithUrl;
  },
};
