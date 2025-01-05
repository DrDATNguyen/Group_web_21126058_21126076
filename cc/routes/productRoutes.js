const express = require('express');
const router = express.Router();
const { getProducts, getProductDetail,directFilter } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductDetail);
router.post('/direct-filter', directFilter);

module.exports = router;
