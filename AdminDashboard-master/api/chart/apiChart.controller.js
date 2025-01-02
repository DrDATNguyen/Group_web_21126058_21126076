const CheckOut = require("../../models/checkout.model");
const ShoppingCart = require("../../models/shoppingcart.model");
const ProductOrder = require("../../models/product_order.model");

module.exports = {
    filterByMonth: async (req, res) => {
        const year = req.query.year;
        const filter = req.query.filter;

        console.log(year, filter);
        const listOrder = await CheckOut.find({ status: "Delivered" });

        let total = 0;
        if (year == "All") {
            const years = req.query.years;
            console.log(years);
            const listYears = years.split(",");
            listYears.sort();
            const data = [];
            for (let i = 0; i < listYears.length; i++) {
                const total = await filterByYear(listYears[i], listOrder);
                data.push({
                    year: listYears[i],
                    total,
                });
            }
            res.status(200).json(data);
        } else {
            const total = await filterByYear(year, listOrder);
            res.status(200).json({
                year,
                total: total,
            });
        }
    },
};

const filterByYear = async (year, listOrder) => {
    let total = 0;
    for (let i = 0; i < listOrder.length; i++) {
        const shoppingCart = await ShoppingCart.find({
            _id: listOrder[i].idShoppingCart,
            purchasedTime: {
                $gte: new Date(year + "-01-01T00:00:00.000Z"),
                $lte: new Date(year + "-12-31T23:59:59.999Z"),
            },
        });
        if (shoppingCart.length != 0) {
            let sum = 0;
            for (let j = 0; j < shoppingCart[0].listProductOrder.length; j++) {
                const productOrder = await ProductOrder.findById(
                    shoppingCart[0].listProductOrder[j]
                );
                sum += productOrder.unitPrice * productOrder.quantity;
            }
            total += sum;
        }
    }
    return total;
};
