
const express = require('express');
const router = express.Router();
const { apiGetProducts } = require('../controllers/productController');

router.get('/', apiGetProducts); // Hiển thị trang đăng nhập

module.exports = router;