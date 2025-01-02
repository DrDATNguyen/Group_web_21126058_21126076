const CheckOut = require("../models/checkout.model");
const ShoppingCart = require("../models/shoppingcart.model");
const ProductOrder = require("../models/product_order.model");

module.exports = {
    showRevenue: async (req, res) => {
        const listOrder = await CheckOut.find({ status: "Delivered" });

        const years = [];
        let total = 0;
        for (let i = 0; i < listOrder.length; i++) {
            const shoppingCart = await ShoppingCart.findById(
                listOrder[i].idShoppingCart
            );
            let sum = 0;
            for (let j = 0; j < shoppingCart.listProductOrder.length; j++) {
                const productOrder = await ProductOrder.findById(
                    shoppingCart.listProductOrder[j]
                );
                sum += productOrder.unitPrice * productOrder.quantity;
            }
            total += sum;
            const date = new Date(shoppingCart.purchasedTime);
            const year = date.getFullYear();
            if (years.indexOf(year) === -1) {
                years.push(year);
            }
        }
        res.render("revenue/home", {
            years,
        });
    },
};
