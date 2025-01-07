const moment = require("moment/moment");
const uuid = require("uuid");
const qs = require("qs");
require("dotenv").config();
const CheckOut = require("../models/CheckOut"); // Import model CheckOut

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
      const { checkoutId, locale = "vn", info } = req.body;
      console.log("ccid",checkoutId)

      const checkout = await CheckOut.findById(checkoutId); // Lấy thông tin checkout từ collection CheckOut
      console.log("cc",checkout)
      // Kiểm tra nếu không tìm thấy checkout hoặc totalAmount không có
      if (!checkout || !checkout.totalAmount) {
        return res.status(400).json({ message: "Checkout information not found." });
      }

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

  async validatePayment(req, res, next) {
    try {
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

      if (secureHash === signed) {
        const transactionStatus = vnp_Params["vnp_TransactionStatus"];
        const orderId = vnp_Params["vnp_TxnRef"];
        const paidAmount = vnp_Params["vnp_Amount"];
        const rspCode = vnp_Params["vnp_ResponseCode"];

        console.log("Payment successful: ", { orderId, paidAmount, rspCode });

        if (transactionStatus !== "00") {
          return res.redirect(
            "http://localhost:3000/cart/payment/failed?method=VNPAY"
          );
        }

        // Xử lý đơn hàng thành công (có thể lưu thông tin thanh toán vào DB ở đây)
        return res.redirect(
          `http://localhost:3000/cart/payment/success?method=VNPAY&orderId=${orderId}`
        );
      } else {
        res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
      }
    } catch (e) {
      return res.redirect(
        "http://localhost:3000/cart/payment/failed?method=VNPAY"
      );
    }
  },
};

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
