const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path'); // Import path module
// const passport = require('passport'); // Import passport
require('./models/association'); // Ensure relationships are set up
const sequelize = require('./models/db'); // Sequelize connection
const productRoutes = require('./routes/productRoutes'); // Product routes
const userRoutes = require('./routes/userRoutes'); // User routes
const passport = require('./models/passport'); // Import passport từ file passport.js

const app = express();

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure session and flash
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Set up view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Configure static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Use routes
app.use('/products', productRoutes);
app.use('/users', userRoutes);

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Sync database
// (async () => {
//     await sequelize.sync({ alter: true });
//     console.log('Database synchronized');
// })();
