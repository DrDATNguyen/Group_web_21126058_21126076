const express = require("express");
const { payment, validatePayment } = require("../controller/payment.controller");
const router = express.Router();

router.post("/urlpayment", payment);
router.get("/validate", validatePayment);

module.exports = router;