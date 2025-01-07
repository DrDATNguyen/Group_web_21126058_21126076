const moment = require("moment/moment");
const uuid = require("uuid");
const qs = require("qs");
require("dotenv").config();
const CheckOut = require("../models/CheckOut"); // Import model CheckOut
const mongoose = require('mongoose');
const ShoppingCart = require("../models/ShoppingCart");
const ProductOrder = require("../models/ProductOrder");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { ObjectId } = mongoose.Types;

module.exports = {
  async payment(req, res, next) {
    try {
      process.env.TZ = "Asia/Ho_Chi_Minh";
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");
      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
      let vnp_TmnCode = process.env.vnp_TmnCode;
      let vnp_HashSecret = process.env.vnp_HashSecret;
      let vnp_Url = process.env.vnp_Url;
      let vnp_ReturnUrl = process.env.vnp_ReturnUrl;
      console.log("vnp_TmnCode",vnp_TmnCode)
      // Lấy thông tin từ body request và lấy thông tin checkout từ database
      const { email,checkoutId, locale = "vn", info } = req.body;
      console.log("ccid",checkoutId)

      const checkout = await CheckOut.findById(checkoutId); // Lấy thông tin checkout từ collection CheckOut
      console.log("cc",checkout)
      // Kiểm tra nếu không tìm thấy checkout hoặc totalAmount không có
      if (!checkout || !checkout.totalAmount) {
        return res.status(400).json({ message: "Checkout information not found." });
      }
      req.session.checkoutId=email
      req.session.checkoutId = checkoutId;
      const totalAmount = checkout.totalAmount; // Lấy giá trị totalAmount từ checkout

      const _id = uuid.v4();
      let currCode = "VND"; // Mã tiền tệ (VND)
      
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = vnp_TmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = _id;
      vnp_Params["vnp_OrderInfo"] = info;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = totalAmount * 100; // VNPay yêu cầu số tiền phải nhân 100 để chuyển sang đơn vị đồng (VND)
      vnp_Params["vnp_ReturnUrl"] = vnp_ReturnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;

      vnp_Params = sortObject(vnp_Params); // Sắp xếp các tham số query

      // Chữ ký bảo mật
      let querystring = qs;
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", vnp_HashSecret);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnp_Url += "?" + querystring.stringify(vnp_Params, { encode: false });

      // Trả về URL để tiến hành thanh toán VNPay
      return res.redirect(vnp_Url); 
    } catch (e) {
      next(e);
    }
  },

  // async validatePayment(req, res, next) {
  //   try {
  //     console.log("validatePayment is called")
  //     let vnp_Params = req.query;
  //     let secureHash = vnp_Params["vnp_SecureHash"];

  //     delete vnp_Params["vnp_SecureHash"];
  //     delete vnp_Params["vnp_SecureHashType"];

  //     vnp_Params = sortObject(vnp_Params);

  //     let secretKey = process.env.vnp_HashSecret;
  //     let querystring = require("qs");

  //     let signData = querystring.stringify(vnp_Params, { encode: false });

  //     let crypto = require("crypto");
  //     let hmac = crypto.createHmac("sha512", secretKey);
  //     let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  //     if (secureHash === signed) {
  //       const transactionStatus = vnp_Params["vnp_TransactionStatus"];
  //       const orderId = vnp_Params["vnp_TxnRef"];
  //       const paidAmount = vnp_Params["vnp_Amount"];
  //       const rspCode = vnp_Params["vnp_ResponseCode"];

  //       console.log("Payment successful: ", { orderId, paidAmount, rspCode });

  //       if (transactionStatus !== "00") {
  //         return res.redirect(
  //           "http://localhost:3000/cart/payment/failed?method=VNPAY"
  //         );
  //       }

  //       // Xử lý đơn hàng thành công (có thể lưu thông tin thanh toán vào DB ở đây)
  //       return res.redirect(
  //         `http://localhost:3000/cart/payment/success?method=VNPAY&orderId=${orderId}`
  //       );
  //     } else {
  //       res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
  //     }
  //   } catch (e) {
  //     return res.redirect(
  //       "http://localhost:3000/cart/payment/failed?method=VNPAY"
  //     );
  //   }
  // },
  
  async validatePayment(req, res, next) {
    try {
      const email = req.session.email;
      const checkoutId = req.session.checkoutId;      
      console.log("checkoutid",checkoutId)
      console.log("email",email)

      // const checkout = await CheckOut.findById(checkoutId); // Lấy thông tin checkout từ collection CheckOut
        console.log("validatePayment is called");

        let vnp_Params = req.query;
        let secureHash = vnp_Params["vnp_SecureHash"];

        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        vnp_Params = sortObject(vnp_Params);

        let secretKey = process.env.vnp_HashSecret;
        let querystring = require("qs");

        let signData = querystring.stringify(vnp_Params, { encode: false });

        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        // Kiểm tra checksum (tính hợp lệ của hash)
        if (secureHash === signed) {
            const transactionStatus = vnp_Params["vnp_TransactionStatus"];
            const orderId = vnp_Params["vnp_TxnRef"];
            const paidAmount = vnp_Params["vnp_Amount"];
            const rspCode = vnp_Params["vnp_ResponseCode"];

            console.log("Payment details: ", { orderId, paidAmount, rspCode });

            // Kiểm tra xem giao dịch có thành công hay không (transactionStatus === "00")
            if (transactionStatus === "00") {
                // Cập nhật trạng thái đơn hàng trong hệ thống là 'Paid'
                await updateCheckoutStatus(checkoutId, email);

                // Thông báo thanh toán thành công và chuyển hướng về trang chủ
                const redirectUrl = "http://localhost:5000";
                return res.redirect(`${redirectUrl}?status=success&message=Thanh toán thành công, cảm ơn quý khách`);
            } else {
                // Thanh toán không thành công, báo lỗi và quay lại trang checkout
                const redirectUrl1 = "http://localhost:5000/checkout";
                return res.redirect(`${redirectUrl1}?status=failure&message=Thanh toán thất bại, vui lòng thử lại.`);
            }
        } else {
            // Nếu checksum không hợp lệ, thông báo lỗi
            const redirectUrl1 = "http://localhost:5000/checkout";
            return res.redirect(`${redirectUrl1}?status=failure&message=Thông tin thanh toán không hợp lệ.`);
        }
    } catch (e) {
        console.error(e);
        // Nếu có lỗi hệ thống, thông báo lỗi và quay lại trang checkout
        const redirectUrl1 = "http://localhost:5000/checkout";
        return res.redirect(`${redirectUrl1}?status=error&message=Lỗi hệ thống, vui lòng thử lại sau.`);
    }
}}


async function updateCheckoutStatus(checkoutId, email) {
  try {
    // Tìm và cập nhật trạng thái thanh toán của Checkout
    const result = await CheckOut.findOneAndUpdate(
      { _id: ObjectId(checkoutId) },
      { $set: { isPaid: true } },
      { new: true }
    );

    if (!result) {
      console.log(`Checkout with id ${checkoutId} not found.`);
      return;
    }

    console.log("Thanh toán thành công", result);

    // Tạo giỏ hàng mới
    const newShoppingCart = new ShoppingCart({
      listProductOrder: [],
      status: false,
      purchasedTime: new Date(), // Sử dụng Date object thay vì chuỗi
    });

    const savedCart = await newShoppingCart.save();

    // Tìm user dựa trên email
    const user = await User.findOne({ email:email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      return;
    }

    // Cập nhật thông tin giỏ hàng của người dùng
    await User.findOneAndUpdate(
      { email },
      {
        idShoppingCart: savedCart._id,
        $addToSet: { listIdShoppingCartHistory: user.idShoppingCart }, // Lưu giỏ hàng cũ vào lịch sử
      }
    );

    // Tạo thông báo cho quản lý hoặc admin
    await Notification.create({
      title: "Đặt hàng",
      content: `Khách hàng ${email} đã đặt hàng`,
      time: new Date(),
      seen: false,
    });

    // Xóa giỏ hàng cũ khỏi thông tin người dùng
    await User.findOneAndUpdate(
      { email },
      { $unset: { idShoppingCart: "" } }
    );

    console.log(`Checkout updated successfully for user: ${email}`);
  } catch (error) {
    console.error("Error updating checkout status:", error);
  }
}



function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
