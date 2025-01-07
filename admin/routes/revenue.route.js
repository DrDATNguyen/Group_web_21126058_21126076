const express = require("express");
const router = express.Router();

const RevenueController = require("../controllers/revenue.controller");

// show list product
router.get("/", RevenueController.showRevenue);

module.exports = router;
