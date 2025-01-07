const express = require("express");
const UserController = require("../controllers/user.controller.js");

const router = express.Router();

router.get("/", UserController.getAllUsers);

// router.get("/list-account/:page", );

// add account
router.get("/add-account", (req, res) => {
  res.render("account/add-account");
});

// add account post
router.post("/add-account", UserController.addAccount);

// edit account
router.get("/edit-account/:id", UserController.editAccountGet);

// edit account post
router.post("/edit-account", UserController.editAccountPost);

// block account
router.get("/block-account/:id", UserController.blockAccount);

// unblock account
router.get("/unblock-account/:id", UserController.unblockAccount);

// delete account
router.get("/delete-account/:id", UserController.deleteAccount);

module.exports = router;
