const express = require("express");
const router = express.Router();
const checkOutController = require("../controller/CheckOutController");
const Checkout = require("../models/CheckOut");  // Import model Checkout (giả định bạn có model này)
const mongoose = require('mongoose');
const User = require("../models/User");

// Route hiển thị trang Checkout
router.get("/", checkOutController.getIndex);

// Route xử lý checkout
// Route xử lý /process-checkout
router.post("/process-checkout", async (req, res) => {
    const { name, numberPhone, email, note, totalAmount,idShoppingCart,isPaid } = req.body;
    
    const checkout = new Checkout({
        name,
        numberPhone,
        email,
        idShoppingCart: mongoose.Types.ObjectId(idShoppingCart), 
        note,
        status: "Pending", // Status mặc định khi tạo
        totalAmount, 
        isPaid      
    });

    try {
        // Lưu checkout vào MongoDB
        const savedCheckout = await checkout.save();
        
        // Trả về `checkoutId` dựa trên `_id` từ MongoDB
        res.json({ checkoutId: savedCheckout._id.toString() ,           
            email: savedCheckout.email
        });
    } catch (err) {
        res.status(500).json({ message: "Error processing checkout", error: err.message });
    }
});


// Route xử lý khi gửi form checkout
router.post("/", checkOutController.postCheckOut);
// router.post("/adddShoppingCart", checkOutController.postShoppingCart);

module.exports = router;
