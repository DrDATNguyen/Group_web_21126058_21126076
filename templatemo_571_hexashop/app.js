const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('./models/association'); // Ensure relationships are set up
const sequelize = require('./models/db'); // Sequelize connection
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const apiRoutes = require('./routes/apiRoutes');
const passport = require('./models/passport');
const app = express();

// Body Parser Configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure Session and Flash
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// Set up view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Configure static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/api', apiRoutes);



// Sync Database
(async () => {
    await sequelize.sync();
    console.log('Database synchronized');
})();

// Start Server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
