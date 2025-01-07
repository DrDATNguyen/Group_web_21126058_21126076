const express = require('express');
const router = express.Router();
const { getProducts, getProductDetail, directFilter,apiGetProducts } = require('../controllers/productController');
const passport = require('passport');

// Middleware kiểm tra xác thực người dùng
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();  // Nếu người dùng đã đăng nhập, tiếp tục xử lý route
    } else {
        res.redirect('users/login');  // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    }
}

// Route công khai
router.get('/',ensureAuthenticated, getProducts);
router.get('/:id',ensureAuthenticated, getProductDetail);


// Route bảo vệ (yêu cầu người dùng đăng nhập)
// router.post('/direct-filter', ensureAuthenticated, directFilter);  // Chỉ những người dùng đã đăng nhập mới có thể sử dụng

// Route đăng xuất
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);  // Nếu có lỗi khi đăng xuất, xử lý lỗi
        }
        res.redirect('/login');  // Sau khi đăng xuất, chuyển hướng đến trang đăng nhập
    });
});

module.exports = router;
