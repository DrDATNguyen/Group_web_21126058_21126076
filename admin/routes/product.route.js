const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/product.controller");

// show list product
router.get("/", ProductController.showListProduct);

// add product
router.get("/add-product", ProductController.addProductGet);

//add product post and add product id to category
router.post("/add-product", ProductController.addProductPost);

// edit product and find current id category of this product
router.get("/edit-product/:id", ProductController.editProductGet);

// edit product post and remove product id to old category and push product id to new category
// and remove product id from listIdProduct of old producer and push product id to new producer
// and using async await
router.post("/edit-product", ProductController.editProductPost);

// delete product
router.get("/delete-product/:id", ProductController.deleteProduct);

module.exports = router;
