const Category = require("../models/category.model");
const Product = require("../models/product.model");

const to_slug = require("../public/js/slug.js");

module.exports = {
  showListCategory: async (req, res) => {
    let perPage = 2; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.query.page || 1; // số page hiện tại
    if (page < 1) {
      page = 1;
    }

    Category.find() // find tất cả các data
      .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .exec((err, categories) => {
        Category.countDocuments(async (err, count) => {
          // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          const listProducts = [];

          for (let i = 0; i < categories.length; i++) {
            const product = await Product.find({
              _id: { $in: categories[i].listIdProduct },
            });

            listProducts.push(product);
          }
          let isCurrentPage;
          const pages = [];
          for (let i = 1; i <= Math.ceil(count / perPage); i++) {
            if (i === +page) {
              isCurrentPage = true;
            } else {
              isCurrentPage = false;
            }
            pages.push({
              page: i,
              isCurrentPage: isCurrentPage,
            });
          }
          res.render("category/list-category", {
            categories,
            pages,
            isNextPage: page < Math.ceil(count / perPage),
            isPreviousPage: page > 1,
            nextPage: +page + 1,
            previousPage: +page - 1,
            products: listProducts,
            length: listProducts.length,
          });
        });
      });
  },
  editCategoryGet: (req, res) => {
    Category.findById(req.params.id, (err, category) => {
      if (err) {
        console.log(err);
      } else {
        res.render("category/edit-category", {
          category,
        });
      }
    });
  },
  editCategoryPost: async (req, res) => {
    const name = req.body.name;
    const image = req.body.urlImage;
    const idCategory = to_slug(req.body.name) + "-" + Date.now();
    const category = await Category.findById(req.body.id);
    const listIdProduct = category.listIdProduct;
    for await (let idProduct of listIdProduct) {
      let product = await Product.findById(idProduct);
      console.log(product);
      let url = idCategory + "/" + product.idProduct;
      await Product.findByIdAndUpdate(idProduct, {
        url: url,
      });
    }
    Category.findByIdAndUpdate(
      req.body.id,
      {
        name: req.body.name,
        image: req.body.urlImage,
        idCategory: idCategory,
      },
      (err, category) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/category?page=1");
        }
      }
    );
  },
  // delete category and product in this category
  deleteCategory: async (req, res) => {
    const category = await Category.findById(req.params.id);
    const listIdProduct = category.listIdProduct;

    for (let i = 0; i < listIdProduct.length; i++) {
      await Product.findByIdAndDelete(listIdProduct[i]);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.redirect("/category?page=1");
  },
  addCategoryPost: (req, res) => {
    const category = new Category({
      name: req.body.name,
      idCategory: to_slug(req.body.name) + "-" + Date.now(),
      image: req.body.urlImage,
      listIdProduct: [],
    });

    category.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/category?page=1");
      }
    });
  },
};
