const express = require('express');
const router = express.Router();
const { getRegistrationPage, registerUser,getLoginPage, loginUser,logoutUser} = require('../controllers/userController');

router.get('/register', getRegistrationPage);
router.post('/register', registerUser);
// Trang đăng nhập
router.get('/login', getLoginPage); // Hiển thị trang đăng nhập
router.post('/login', loginUser);   // Xử lý đăng nhập

router.get('/logout', logoutUser); // Hiển thị trang đăng nhập

module.exports = router;
