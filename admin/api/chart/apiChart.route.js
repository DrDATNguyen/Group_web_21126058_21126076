const express = require("express");
const ChartController = require("./apiChart.controller");

const router = express.Router();

router.get("/filter-month", ChartController.filterByMonth);

module.exports = router;
