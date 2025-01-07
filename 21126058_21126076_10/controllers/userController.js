// const User = require('../models/userModel'); // Ensure correct path to your User model
// // const bcrypt = require('bcrypt'); // To hash the password
// const bcrypt = require('bcryptjs');  // If you're using bcryptjs instead of bcrypt

// exports.registerUser = async (req, res) => {
//     try {
//         const { UserName, Pass, Email, PhoneNumber } = req.body;

//         // Check if all fields are provided
//         if (!UserName || !Pass || !Email || !PhoneNumber) {
//             return res.status(400).send('All fields are required');
//         }

//         // Check if the user already exists
//         const existingUser = await User.findOne({ where: { Email } });
//         if (existingUser) {
//             return res.status(400).send('User with this email already exists');
//         }

//         // Hash the password before saving it to the database
//         const hashedPassword = await bcrypt.hash(Pass, 10);

//         // Create a new user record
//         await User.create({
//             UserName,
//             Pass: hashedPassword, // Store the hashed password
//             Email,
//             PhoneNumber,
//             status: true, // Assuming the user is active by default
//             timestamp: new Date()
//         });

//         // Send success message and redirect to the 'list' page
//         req.flash('success', 'Registration successful!'); // Use flash messages to show the success message
//         res.redirect('/products'); // Redirect to the list page, which will render 'list.hbs'

//     } catch (err) {
//         console.error('Error registering user:', err);
//         res.status(500).send('Error registering user');
//     }
// };

// // Hàm đăng nhập người dùng
// exports.loginUser = async (req, res) => {
//     try {
//         const { Email, Pass } = req.body;

//         // Kiểm tra xem email và mật khẩu có được cung cấp không
//         if (!Email || !Pass) {
//             return res.status(400).send('Email and password are required');
//         }

//         // Kiểm tra người dùng có tồn tại không
//         const user = await User.findOne({ where: { Email } });
//         if (!user) {
//             return res.status(400).send('User with this email does not exist');
//         }

//         // Kiểm tra mật khẩu
//         const isMatch = await bcrypt.compare(Pass, user.Pass);
//         if (!isMatch) {
//             return res.status(400).send('Incorrect password');
//         }

//         // Tạo session cho người dùng khi đăng nhập thành công
//         req.session.user = user; // Lưu thông tin người dùng vào session

//         // Redirect đến trang sản phẩm hoặc trang home
//         res.redirect('/products'); // Hoặc trang chính nếu bạn muốn
//     } catch (err) {
//         console.error('Error logging in user:', err);
//         res.status(500).send('Error logging in user');
//     }
// };

// // Trang đăng nhập
// exports.getLoginPage = (req, res) => {
//     res.render('users/login'); // Render form đăng nhập
// };
// exports.getRegistrationPage = (req, res) => {
//     res.render('users/registration'); // Render registration form
// };
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { UserName, Pass, Email, PhoneNumber } = req.body;

        if (!UserName || !Pass || !Email || !PhoneNumber) {
            return res.status(400).send('All fields are required');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).send('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(Pass, 10);

        // Create user
        await User.create({
            UserName,
            Pass: hashedPassword,
            Email,
            PhoneNumber,
            status: true, // Active by default
            timestamp: new Date(),
        });

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/users/login'); // Redirect to login page
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
};

// Login User
exports.loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Error during authentication:', err); // In lỗi ra console
            return next(err);
        }
        if (!user) {
            console.warn('Authentication failed: Invalid email or password'); // In cảnh báo khi không tìm thấy user
            req.flash('error', 'Invalid email or password');
            return res.redirect('/users/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Error during login:', err); // In lỗi khi xảy ra vấn đề trong req.logIn
                return next(err);
            }
            console.log(`User ${user.UserName} logged in successfully`); // In thông báo khi user đăng nhập thành công
            req.flash('success', 'Login successful! Welcome back.');
            return res.redirect('/products'); // Chuyển đến trang sản phẩm
        });
    })(req, res, next);
};



// Logout User
exports.logoutUser = (req, res) => {
    req.logout(err => {
        if (err) return res.status(500).send('Error logging out');
        req.flash('success', 'You have logged out');
        res.redirect('/users/login');
    });
};

// Render login page
exports.getLoginPage = (req, res) => {
    res.render('users/login', { messages: req.flash() });
};

// Render registration page
exports.getRegistrationPage = (req, res) => {
    res.render('users/registration', { messages: req.flash() });
};

// Render protected page
exports.getProtectedPage = (req, res) => {
    res.send(`Hello ${req.user.UserName}, you have access to this protected route!`);
};
