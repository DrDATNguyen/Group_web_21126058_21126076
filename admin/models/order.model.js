const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  products: [productSchema], // Danh sách các sản phẩm trong đơn hàng
  paymentIntent: {
    method: {
      type: String, // VD: VNPAY, CASH, ...
      required: true
    },
    status: {
      type: String, // VD: success, pending, failed...
      required: true
    }
  },
  orderStatus: {
    type: String, // Trạng thái của đơn hàng (VD: "Delivering", "Shipped", "Completed", "Cancelled"...)
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  total: {
    type: Number, // Tổng giá trị của đơn hàng
    required: true
  },
  totalAfterDiscount: {
    type: Number, // Tổng tiền sau khi đã áp dụng giảm giá
    required: true
  },
  totalQuantity: {
    type: Number, // Tổng số lượng các sản phẩm
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Mô hình MongoDB
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;