const express = require("express");
const AdminController = require("../controllers/admin.controller");

// var config = require("../config/");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/login", AdminController.getLogin);

router.post("/login", AdminController.postLogin);

router.get("/logout", AdminController.logout);

router.get("/add-admin", AdminController.getAddAdmin);

router.post("/add-admin", AdminController.postAddAdmin);

router.get("/profile", auth, AdminController.profile);

// edit profile
router.get("/edit-profile", AdminController.getEditProfile);

// edit profile post
router.post("/edit-profile", AdminController.postEditProfile);

// change password
router.get("/change-password", AdminController.getChangePassword);

// change password post
router.post("/change-password", AdminController.postChangePassword);

// show all admin
router.get("/", AdminController.showAllAdmin);

module.exports = router;
