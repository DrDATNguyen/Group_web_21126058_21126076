const Product = require('../models/productModel');

const ProductsType = require('../models/productTypeModel'); // Import model ProductsType
const bcrypt = require('bcryptjs');  // If you're using bcryptjs instead of bcrypt
const { Op } = require('sequelize'); // Để sử dụng các toán tử Sequelize như LIKE, BETWEEN, ...

exports.getProducts = async (req, res) => { 
    try {
        const productsTypes = await ProductsType.findAll();  // Get all product types
        
        // Fetch products for each product type
        for (let i = 0; i < productsTypes.length; i++) {
            const productTypeId = productsTypes[i].id;
            const products = await Product.findAll({
                where: {
                    ID_products_types: productTypeId
                }
            });
            // console.log(products);
            // Add products to the product type object
            productsTypes[i].dataValues.products = products;
        }
        console.log(productsTypes);
        // Render the view and pass productsTypes (with their products)
        res.render('products/list', { productsTypes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};




exports.getProductDetail = async (req, res) => {
    try {
        const productId = req.params.id; // Get the product ID from the URL parameter

        // Fetch the product by ID from the database
        const product = await Product.findByPk(productId);

        // If the product doesn't exist, return a 404 error
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Render the product detail page with the product data
        res.render('products/detail', {
            name: product.name,
            imageUrl: product.thumb, // Assuming 'thumb' contains the image file path
            description: product.content, // Assuming 'content' contains the product description
            price: product.Price,
            id: product.id
        });
    } catch (error) {
        console.error('Error fetching product details:', error); // Log the error
        res.status(500).send('Server Error'); // Return a 500 error if something goes wrong
    }
};
// productController.js

exports.filterProducts = async (req, res) => {
    try {
      const { searchQuery, category, price, availability, rating } = req.query;
  
      // Xử lý các điều kiện lọc
      const conditions = {};
  
      if (searchQuery) {
        conditions.name = { [Op.like]: `%${searchQuery}%` }; // Tìm kiếm sản phẩm có tên chứa từ khóa
      }
  
      if (category) {
        conditions.categoryId = category;
      }
  
      if (price === 'low') {
        conditions.Price = { [Sequelize.Op.lt]: 50 };  // Lọc sản phẩm có giá dưới 50
      } else if (price === 'medium') {
        conditions.Price = { [Sequelize.Op.between]: [50, 100] }; // Lọc sản phẩm có giá từ 50 đến 100
      } else if (price === 'high') {
        conditions.Price = { [Sequelize.Op.gt]: 100 }; // Lọc sản phẩm có giá trên 100
      }
  
      if (availability === 'inStock') {
        conditions.inStock = true;
      } else if (availability === 'outOfStock') {
        conditions.inStock = false;
      }
  
      if (rating) {
        conditions.rating = { [Sequelize.Op.gte]: rating }; // Lọc sản phẩm có rating >= rating
      }
  
      // Truy vấn với các điều kiện lọc
      const products = await Product.findAll({
        where: conditions,
        include: [ProductsType], // Bao gồm thông tin loại sản phẩm
      });
  
      res.json(products); // Trả về danh sách sản phẩm đã lọc dưới dạng JSON
    } catch (error) {
      console.error('Error filtering products:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  exports.directFilter = async (req, res) => {
    try {
      const { searchQuery, category, price, availability, rating } = req.body;
  
      const conditions = {};
  
      // Lọc theo tên hoặc mô tả
      if (searchQuery) {
        conditions.name = { [Op.like]: `%${searchQuery}%` }; // Lọc sản phẩm có tên chứa từ khóa
      }
  
      // Lọc theo loại sản phẩm
      if (category) {
        conditions.ID_products_types = category;
      }
  
      // Lọc theo giá
      if (price === 'low') {
        conditions.Price = { [Op.lt]: 50 };
      } else if (price === 'medium') {
        conditions.Price = { [Op.between]: [50, 100] };
      } else if (price === 'high') {
        conditions.Price = { [Op.gt]: 100 };
      }
  
      // Lọc theo trạng thái còn hàng
      if (availability === 'inStock') {
        conditions.status = true;
      } else if (availability === 'outOfStock') {
        conditions.status = false;
      }
  
      // Lọc theo đánh giá
      if (rating) {
        conditions.rating = { [Op.gte]: rating };
      }
  
      const products = await Product.findAll({
        where: conditions,
        include: [ProductsType], // Bao gồm loại sản phẩm
      });
  
      res.json(products);
    } catch (error) {
      console.error('Error filtering products:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  