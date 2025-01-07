const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema sản phẩm trong đơn hàng
const productOrderSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product', // Liên kết đến mô hình Product
      required: true,
    },
    count: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    color: {
      type: String,
      required: true,
    },
    feature: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

// Schema cho đơn hàng
const orderSchema = new Schema(
  {
    products: [productOrderSchema], // Danh sách các sản phẩm trong đơn hàng
    paymentIntent: {
      method: {
        type: String, // Phương thức thanh toán (VD: VNPAY, CASH, ...)
        required: true,
      },
      status: {
        type: String, // Trạng thái thanh toán (VD: success, failed, ...)
        required: true,
      },
    },
    orderStatus: {
      type: String, // Trạng thái đơn hàng (VD: Delivering, Shipped, Completed, Cancelled, ...)
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    total: {
      type: Number, // Tổng tiền của đơn hàng
      required: true,
    },
    totalAfterDiscount: {
      type: Number, // Tổng tiền sau khi áp dụng giảm giá (nếu có)
      required: true,
    },
    totalQuantity: {
      type: Number, // Tổng số lượng sản phẩm trong đơn hàng
      required: true,
    },
  },
  { timestamps: true }
);

// Tạo model và xuất mô hình
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
