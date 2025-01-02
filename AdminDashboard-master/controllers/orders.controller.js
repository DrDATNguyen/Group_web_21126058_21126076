const CheckOut = require("../models/checkout.model");
const User = require("../models/user.model");
const ShoppingCart = require("../models/shoppingcart.model");
const ProductOrder = require("../models/product_order.model");
const Product = require("../models/product.model");

module.exports = {
    showListOrder: async (req, res) => {
        let perPage = 3; // số lượng sản phẩm xuất hiện trên 1 page
        let page = req.query.page || 1; // số page hiện tại
        if (page < 1) {
            page = 1;
        }

        const listOrder = await CheckOut.find({})
            .skip(perPage * page - perPage)
            .limit(perPage);
        const count = await CheckOut.countDocuments();
        for (let i = 0; i < listOrder.length; i++) {
            const Customer = await User.find({ email: listOrder[i].email });
            listOrder[i].name = Customer[0].name;
            listOrder[i].address = Customer[0].address;

            const shoppingCart = await ShoppingCart.findById(
                listOrder[i].idShoppingCart
            );
            let sum = 0;
            listOrder[i].time = shoppingCart.purchasedTime;
            listOrder[i].listProductOrder = [];
            for (let j = 0; j < shoppingCart.listProductOrder.length; j++) {
                const productOrder = await ProductOrder.findById(
                    shoppingCart.listProductOrder[j]
                );
                sum += productOrder.unitPrice * productOrder.quantity;
                listOrder[i].listProductOrder.push(productOrder);
            }
            listOrder[i].total = sum;
        }

        let isCurrentPage;
        const pages = [];
        for (let i = 1; i <= Math.ceil(count / perPage); i++) {
            if (i === +page) {
                isCurrentPage = true;
            } else {
                isCurrentPage = false;
            }
            pages.push({
                page: i,
                isCurrentPage: isCurrentPage,
            });
        }

        res.render("orders/list-orders", {
            listOrder,
            pages,
            isNextPage: page < Math.ceil(count / perPage),
            isPreviousPage: page > 1,
            nextPage: +page + 1,
            previousPage: +page - 1,
        });
    },
    acceptOrder: async (req, res) => {
        const id = req.params.id;
        const order = await CheckOut.findById(id);
        order.status = "Delivering";
        await order.save();

        // const shoppingCart = await ShoppingCart.findById(order.idShoppingCart);

        // for (let i = 0; i < shoppingCart.listProductOrder.length; i++) {
        //     const productOrder = await ProductOrder.findById(
        //         shoppingCart.listProductOrder[i]
        //     );
        //     const product = await Product.find({
        //         idProduct: productOrder.idProduct,
        //     });
        //     //console.log(product[0].quantity);
        //     console.log(product[0]);
        //     console.log(productOrder);
        //     //console.log(productOrder.quantity);
        //     //product[0].quantity -= productOrder.quantity;
        //     //await product[0].save();
        // }

        res.redirect("/orders?page=1");
    },
    cancelOrder: async (req, res) => {
        const id = req.params.id;
        const order = await CheckOut.findById(id);
        order.status = "Canceled";
        await order.save();
        res.redirect("/orders?page=1");
    },
};
