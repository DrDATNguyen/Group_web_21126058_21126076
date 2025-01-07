const express = require("express");
const router = express.Router();
const paymentController = require("../controller/payment");

// Route hiển thị form thanh toán
router.get("/payment-method", (req, res) => {
  const checkoutId = req.query.checkoutId; // Lấy checkoutId từ URL query string
  res.render("payment-method/payment-method", {
    checkoutId: checkoutId, // Truyền thông tin checkoutId vào file Handlebars
  });
});

// Route tiếp nhận dữ liệu từ form thanh toán
router.post("/payment", paymentController.payment);
// Route xác thực thanh toán VNPay (sau khi VNPay redirect lại)
router.get("/validate", paymentController.validatePayment);

module.exports = router;