const User = require('../models/userModel'); // Ensure correct path to your User model
// const bcrypt = require('bcrypt'); // To hash the password
const bcrypt = require('bcryptjs');  // If you're using bcryptjs instead of bcrypt

exports.registerUser = async (req, res) => {
    try {
        const { UserName, Pass, Email, PhoneNumber } = req.body;

        // Check if all fields are provided
        if (!UserName || !Pass || !Email || !PhoneNumber) {
            return res.status(400).send('All fields are required');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).send('User with this email already exists');
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(Pass, 10);

        // Create a new user record
        await User.create({
            UserName,
            Pass: hashedPassword, // Store the hashed password
            Email,
            PhoneNumber,
            status: true, // Assuming the user is active by default
            timestamp: new Date()
        });

        // Send success message and redirect to the 'list' page
        req.flash('success', 'Registration successful!'); // Use flash messages to show the success message
        res.redirect('/products'); // Redirect to the list page, which will render 'list.hbs'

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
};

// Hàm đăng nhập người dùng
exports.loginUser = async (req, res) => {
    try {
        const { Email, Pass } = req.body;

        // Kiểm tra xem email và mật khẩu có được cung cấp không
        if (!Email || !Pass) {
            return res.status(400).send('Email and password are required');
        }

        // Kiểm tra người dùng có tồn tại không
        const user = await User.findOne({ where: { Email } });
        if (!user) {
            return res.status(400).send('User with this email does not exist');
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(Pass, user.Pass);
        if (!isMatch) {
            return res.status(400).send('Incorrect password');
        }

        // Tạo session cho người dùng khi đăng nhập thành công
        req.session.user = user; // Lưu thông tin người dùng vào session

        // Redirect đến trang sản phẩm hoặc trang home
        res.redirect('/products'); // Hoặc trang chính nếu bạn muốn
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).send('Error logging in user');
    }
};

// Trang đăng nhập
exports.getLoginPage = (req, res) => {
    res.render('users/login'); // Render form đăng nhập
};
exports.getRegistrationPage = (req, res) => {
    res.render('users/registration'); // Render registration form
};
