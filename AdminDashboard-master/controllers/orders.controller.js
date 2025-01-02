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
            // Kiểm tra xem Customer có tồn tại không
            if (Customer && Customer.length > 0) {
                listOrder[i].name = Customer[0].name;
                listOrder[i].address = Customer[0].address;
            } else {
                listOrder[i].name = "Không có tên khách hàng";
                listOrder[i].address = "Không có địa chỉ";
            }

            const shoppingCart = await ShoppingCart.findById(listOrder[i].idShoppingCart);
            let sum = 0;
            // Kiểm tra xem shoppingCart có tồn tại không
            if (shoppingCart) {
                listOrder[i].time = shoppingCart.purchasedTime;
                listOrder[i].listProductOrder = [];
                
                for (let j = 0; j < shoppingCart.listProductOrder.length; j++) {
                    const productOrder = await ProductOrder.findById(shoppingCart.listProductOrder[j]);
                    // Kiểm tra nếu productOrder tồn tại không
                    if (productOrder) {
                        sum += productOrder.unitPrice * productOrder.quantity;
                        listOrder[i].listProductOrder.push(productOrder);
                    }
                }
            } else {
                listOrder[i].time = "Không có thời gian";
                listOrder[i].listProductOrder = [];
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
        
        // Kiểm tra xem order có tồn tại không
        if (order) {
            order.status = "Delivering";
            await order.save();
        }
        res.redirect("/orders?page=1");
    },

    cancelOrder: async (req, res) => {
        const id = req.params.id;
        const order = await CheckOut.findById(id);
        
        // Kiểm tra xem order có tồn tại không
        if (order) {
            order.status = "Canceled";
            await order.save();
        }
        
        res.redirect("/orders?page=1");
    },
};
