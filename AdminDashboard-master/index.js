const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const Handlebars = require("handlebars");
const socket = require("socket.io");
const cors = require("cors");
const {
    allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const connectDB  = require("./services/database.service");
const helpers = require("./helpers/viewEngine.js");
const env = require("dotenv").config();

const AdminRoute = require("./routes/admin.route");
const AccountRoute = require("./routes/account.route");
const ProductRoute = require("./routes/product.route");
const CategoryRoute = require("./routes/category.route");
const ProducerRoute = require("./routes/producer.route");
const RevenueRouter = require("./routes/revenue.route");
const OrdersRoute = require("./routes/orders.route");
const ApiChartRoute = require("./api/chart/apiChart.route");
const ApiNotificationRoute = require("./api/notification/apiNotification.route");
const SessionMiddleware = require("./middlewares/session");
const PassportMiddleware = require("./middlewares/passport");
const LocalsMiddleware = require("./middlewares/locals");
const AuthMiddleware = require("./middlewares/auth");
const AdminController = require('./controllers/admin.controller'); // Đảm bảo đường dẫn đến file đúng

connectDB();    

const app = express();

app.engine(
    "hbs",
    exphbs({
        extname: ".hbs",
        defaultLayout: "main",
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers: helpers,
    })
);
app.set("view engine", "hbs");

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "/public")));

SessionMiddleware(app);
PassportMiddleware(app);
app.use(LocalsMiddleware);
const createDefaultAdmin = async () => {
    try {
      await new Promise((resolve, reject) => {
        AdminController.postAddAdmin({}, { redirect: resolve }, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
      console.log('Admin đã được tạo');
    } catch (error) {
      console.error('Có lỗi khi tạo admin:', error);
    }
  };
  
  createDefaultAdmin();
app.get("/", AuthMiddleware, function (req, res) {
    res.render("home");
});

app.use("/admin", AdminRoute);

app.use("/account", AuthMiddleware, AccountRoute);
app.use("/product", AuthMiddleware, ProductRoute);
app.use("/category", AuthMiddleware, CategoryRoute);
app.use("/producer", AuthMiddleware, ProducerRoute);
app.use("/orders", AuthMiddleware, OrdersRoute);
app.use("/revenue", AuthMiddleware, RevenueRouter);
app.use("/api/chart", AuthMiddleware, ApiChartRoute);
app.use("/api/notification", AuthMiddleware, ApiNotificationRoute);

app.use((req, res) => {
    res.render("errors/404", { layout: false });
});

app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(500).render("errors/500", { layout: false, error: err.message });
});

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`App listening on port ${process.env.PORT || 3000}`);
});

const io = socket(server);
io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("disconnect", function () {
        console.log("Made socket disconnected");
    });

    socket.on("send-notification", function (data) {
        // io.emit("new-notification", data);
        socket.broadcast.emit("new-notification", data);
    });
});
