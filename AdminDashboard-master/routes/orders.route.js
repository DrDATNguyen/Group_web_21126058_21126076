const express = require("express");
const OrdersController = require("../controllers/orders.controller");

const router = express.Router();

router.get("/", OrdersController.showListOrder);

router.get("/accept-orders/:id", OrdersController.acceptOrder);

router.get("/cancel-orders/:id", OrdersController.cancelOrder);

module.exports = router;
