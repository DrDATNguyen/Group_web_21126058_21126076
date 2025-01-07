const express = require("express");
const NotificationController = require("./apiNotification.controller.js");

const router = express.Router();

router.get("/notify", NotificationController.notify);

router.get("/update-status/:id", NotificationController.updateStatus);

module.exports = router;
