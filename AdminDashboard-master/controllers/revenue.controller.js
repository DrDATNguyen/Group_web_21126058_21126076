const CheckOut = require("../models/checkout.model");
const ShoppingCart = require("../models/shoppingcart.model");
const ProductOrder = require("../models/product_order.model");

module.exports = {
    showRevenue: async (req, res) => {
        const listOrder = await CheckOut.find({ status: "Delivered" });

        const years = [];
        let total = 0;
        for (let i = 0; i < listOrder.length; i++) {
            const shoppingCart = await ShoppingCart.findById(listOrder[i].idShoppingCart);
            
            // Kiểm tra shoppingCart có tồn tại và có danh sách sản phẩm
            if (shoppingCart && shoppingCart.listProductOrder) {
                let sum = 0;
                for (let j = 0; j < shoppingCart.listProductOrder.length; j++) {
                    const productOrder = await ProductOrder.findById(shoppingCart.listProductOrder[j]);
                    
                    // Kiểm tra productOrder có tồn tại không
                    if (productOrder) {
                        sum += productOrder.unitPrice * productOrder.quantity;
                    }
                }
                total += sum;
            }

            const date = new Date(shoppingCart ? shoppingCart.purchasedTime : 0);
            const year = date.getFullYear();
            if (years.indexOf(year) === -1) {
                years.push(year);
            }
        }
        
        res.render("revenue/home", {
            years,
            total, // Bạn có thể hiển thị tổng doanh thu nếu muốn
        });
    },
};
