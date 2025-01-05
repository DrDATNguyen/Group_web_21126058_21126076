const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./userModel'); // Import model Users

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email', // Field của email trong form đăng nhập
            passwordField: 'password', // Field của mật khẩu trong form đăng nhập
        },
        async (email, password, done) => {
            try {
                // Tìm người dùng dựa vào email
                const user = await User.findOne({ where: { Email: email } });
                console.log(user); // In thông tin user ra để kiểm tra

                if (!user) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Kiểm tra mật khẩu
                const isMatch = await bcrypt.compare(password, user.Pass);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Trả về thông tin người dùng nếu xác thực thành công
                return done(null, user);
            } catch (err) {
                console.error('Error in local strategy:', err);
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user); // Kiểm tra thông tin user
    if (user && user.id) {
        done(null, user.id); // Lưu ID người dùng vào session
    } else {
        done(new Error('User ID not found'), null); // Nếu không có ID người dùng, trả lỗi
    }
});

passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user with ID:', id); // Kiểm tra ID
    try {
        const user = await User.findByPk(id);
        if (user) {
            console.log('User found:', user); // Kiểm tra thông tin user
            done(null, user); // Trả về thông tin người dùng
        } else {
            done(null, false); // Nếu không tìm thấy user
        }
    } catch (err) {
        console.error('Error in deserializing user:', err);
        done(err, false); // Xử lý lỗi
    }
});

module.exports = passport;
