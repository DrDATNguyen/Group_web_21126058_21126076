const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CheckOut = new Schema(
  {
    email: { type: String, maxlength: 255 },
    numberPhone: { type: String, maxlength: 255 },
    idShoppingCart: { type: Schema.Types.ObjectId },
    note: { type: String, maxlength: 255 },
    status: { type: String, maxlength: 255 },
    totalAmount: { type: Number, required: false }, // Thêm trường totalAmount vào Schema
    isPaid: { type: Boolean, default: false } // Trường kiểm tra thanh toán, mặc định là false

  },

  { collection: "check-out" }
);

module.exports = mongoose.model("CheckOut", CheckOut);
