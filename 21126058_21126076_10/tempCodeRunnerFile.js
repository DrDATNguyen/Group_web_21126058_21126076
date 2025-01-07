const sequelize = require('./models/db'); // Kết nối Sequelize
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/associations'); // Đảm bảo các quan hệ được thiết lập

(async () => {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
})();