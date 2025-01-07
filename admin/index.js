
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
const connectDB = require("./services/database.service");
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
const multer = require("multer");
const cloudinary = require('./config/cloudinary.js');
const {CloudinaryStorage}= require("multer-storage-cloudinary")
connectDB();
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'BANK',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit'}],
})
const upload = multer({
    storage: storage,
})
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));

// Multer configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname, "/public/image/"));
//     },
//     filename: function (req, file, cb) {
//       const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
//     },
//   });
//   const multerFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith("image")) {
//       cb(null, true);  // Cho phép file nếu định dạng là ảnh
//     } else {
//       cb({ message: "Unsupported file format" }, false); // Từ chối nếu không phải ảnh
//     }
//   };
//   const uploadPhoto = multer({
//     storage: storage,
//     fileFilter: multerFilter,
//     limits: { fileSize: 1000000 }, // Giới hạn kích thước tệp tối đa là 1MB (1000000 bytes)
//   });

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

app.get("/", AuthMiddleware, function (req, res) {
    res.render("home");
});

// Upload API Example
app.post("/upload", upload.fields([{ name: "image", maxCount: 5 }]), (req, res) => {
    try {
        if (!req.files || !req.files.image || req.files.image.length === 0) {
            return res.status(400).send("No files uploaded");
        }

        const fileLinks = req.files.image.map(file => file.path);
        res.status(200).json({ links: fileLinks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// app.post("/upload", upload.fields([
//     { name: "image", maxCount: 1 },  // Chỉ upload 1 ảnh chính
//     { name: "extraImages", maxCount: 5 }, // Có thể upload tối đa 5 ảnh phụ
//   ]), (req, res) => {
//     try {
//       const fileLinks = [];
  
//       // Kiểm tra và thêm đường dẫn ảnh chính
//       if (req.files && req.files.image) {
//         req.files.image.forEach(file => {
//           fileLinks.push(file.path); // Thêm đường dẫn ảnh chính từ Cloudinary
//         });
//       }
  
//       // Kiểm tra và thêm đường dẫn ảnh bổ sung
//       if (req.files && req.files.extraImages) {
//         req.files.extraImages.forEach(file => {
//           fileLinks.push(file.path); // Thêm đường dẫn ảnh phụ từ Cloudinary
//         });
//       }
  
//       if (fileLinks.length === 0) {
//         return res.status(400).json({ error: "No files uploaded" }); // Nếu không có ảnh tải lên
//       }
  
//       res.status(200).json({ links: fileLinks }); // Trả về các đường dẫn của ảnh
  
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({ error: error.message }); // Nếu có lỗi server
//     }
//   });
  



// Routes
app.use("/admin", AdminRoute);
app.use("/account", AuthMiddleware, AccountRoute);
app.use("/product", AuthMiddleware, ProductRoute);
app.use("/category", AuthMiddleware, CategoryRoute);
app.use("/producer", AuthMiddleware, ProducerRoute);
app.use("/orders", AuthMiddleware, OrdersRoute);
app.use("/revenue", AuthMiddleware, RevenueRouter);
app.use("/api/chart", AuthMiddleware, ApiChartRoute);
app.use("/api/notification", AuthMiddleware, ApiNotificationRoute);

// Error Handling
app.use((req, res) => {
    res.status(404).render("errors/404", { layout: false });
});

app.use((err, req, res, next) => {
    console.error(err.message);
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
        socket.broadcast.emit("new-notification", data);
    });
});
