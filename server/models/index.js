// Database Models
const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    bengali: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Bouquet', 'Rose', 'Sunflower', 'Lily', 'Orchid', 'Jasmine', 'Custom']
  },
  image: {
    type: String,
    required: true
  },
  images: [String],
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      userName: String,
      rating: Number,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Bangladesh'
    }
  },
  profileImage: String,
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      quantity: Number,
      price: Number,
      image: String
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 100
  },
  discount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  deliveryAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    district: String,
    postalCode: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date
});

module.exports = {
  Product: mongoose.model('Product', productSchema),
  User: mongoose.model('User', userSchema),
  Order: mongoose.model('Order', orderSchema)
};
