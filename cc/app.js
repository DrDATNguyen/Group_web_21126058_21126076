const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/association'); // Đảm bảo các quan hệ được thiết lập
const sequelize = require('./models/db'); // Kết nối Sequelize
const productRoutes = require('./routes/productRoutes'); // Các route của sản phẩm
const userRoutes = require('./routes/userRoutes'); // Các route của người dùng

const app = express();

// Cấu hình body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cấu hình session và flash
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Cài đặt view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Sử dụng route
app.use('/products', productRoutes);
app.use('/users', userRoutes);

// Khởi chạy server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Đồng bộ cơ sở dữ liệu
(async () => {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
})();
