const ShoppingCart = require("../models/ShoppingCart");
const ProductOrder = require("../models/ProductOrder");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const CheckOut = require("../models/CheckOut");
const env = require("dotenv").config();

module.exports = {
    getIndex: async (req, res) => {
        if (!req.user) {
            res.redirect("/login?error=notLoggedIn");
            return;
        }
    
        // Fetch user information
        const user = await User.findOne({ email: req.user.email });
    
        // Fetch shopping cart data using the user's current shopping cart ID
        const shoppingCart = await ShoppingCart.findById(user.idShoppingCart);
        
        let listProductOrder = [];
        let sumPrice = 0;
        
        // Loop through each product in the shopping cart
        for await (let idProductOrder of shoppingCart.listProductOrder) {
            // Fetch individual product order details
            let productOrder = await ProductOrder.findById(idProductOrder).lean();
    
            // Calculate the sum price for the product
            productOrder.sumPriceProduct = productOrder.quantity * productOrder.unitPrice;
            sumPrice += productOrder.sumPriceProduct;
    
            // Add the product to the list of products in the order
            listProductOrder.push(productOrder);
        }
    
        // Error handling
        const errorNumberPhone = req.query.error;
        const errorListProduct = req.query.errorListProduct;
        
        // Render the checkout view and pass relevant data
        res.render("checkout/checkout", {
            // user: user,  // Pass the user data to the view
            listProductOrder: listProductOrder,
            sumPrice: sumPrice,
            errorNumberPhone: errorNumberPhone,
            errorListProduct: errorListProduct,
            admin_url: process.env.ADMIN_URL,   
            idShoppingCart: user.idShoppingCart,
        });
    },
    
   // Server-side code to handle the checkout process
postCheckOut: async (req, res) => {
    const { numberPhone, emailUser, note, totalAmount, isPaid } = req.body;

    // Validate phone number
    if (!numberPhone || !validate(numberPhone)) {
        res.redirect("/checkout?error=numberPhone");
        return;
    }

    // Check if the shopping cart has valid products
    const user = await User.findOne({ email: req.user.email });
    const shoppingCartUser = await ShoppingCart.findById(user.idShoppingCart);

    if (shoppingCartUser.listProductOrder.length <= 0) {
        res.redirect("/checkout?errorListProduct=errorListProduct");
        return;
    }

    // Creating new Checkout object with all necessary information
    const newCheckOut = new CheckOut({
        email: req.user.email,
        numberPhone: numberPhone,
        idShoppingCart: user.idShoppingCart,
        note: note,
        status: "Pending", // Setting initial order status
        totalAmount: totalAmount, // Pass the total amount
        isPaid: isPaid, // Indicate if the payment is completed
    });

    await newCheckOut.save((err) => {
        if (err) {
            console.log(err);
            res.redirect("/checkout?error=savingCheckout");
        }
    });

    // Resetting the shopping cart after checkout
    const newShoppingCart = new ShoppingCart({
        listProductOrder: [],
        status: false,
        purchasedTime: new Date().toLocaleString(),
    });

    await newShoppingCart.save(async (err, data) => {
        if (err) {
            console.log(err);
        } else {
            try {
                // Update user's shopping cart reference to the new empty cart
                await User.findOneAndUpdate(
                    { email: req.user.email },
                    {
                        idShoppingCart: data._id,
                        $addToSet: {
                            listIdShoppingCartHistory: user.idShoppingCart,
                        },
                    }
                );
            } catch (error) {
                console.log(error);
            }
        }
    });

    // Create a notification for the order placement
    await Notification.create({
        title: "Đặt hàng",
        content: `Khách hàng ${req.body.name} đã đặt hàng`,
        time: new Date().toLocaleString(),
        seen: false,
    });

    // Redirect to the home page after successful order creation
    return res.redirect("/home");
}};

function validate(phone) {
    const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return regex.test(phone);
}
