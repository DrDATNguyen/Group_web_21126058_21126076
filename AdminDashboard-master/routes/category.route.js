const express = require("express");
const router = express.Router();

const CategoryController = require("../controllers/category.controller");

// show list category and product in this category
router.get("/", CategoryController.showListCategory);

// edit category
router.get("/edit-category/:id", CategoryController.editCategoryGet);

// edit category post
router.post("/edit-category", CategoryController.editCategoryPost);

// delete category and product in this category
router.get("/delete-category/:id", CategoryController.deleteCategory);

// add category
router.get("/add-category", (req, res) => {
  res.render("category/add-category");
});

// add category post
router.post("/add-category", CategoryController.addCategoryPost);

module.exports = router;
