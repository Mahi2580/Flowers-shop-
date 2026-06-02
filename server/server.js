// Main Server File
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowers-shop')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Import Models
const { Product, User, Order } = require('./models/index');

// ==================== PRODUCT ROUTES ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product (Admin only)
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, image, quantity } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ success: false, message: 'সকল তথ্য পূরণ করুন' });
    }

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      category,
      image,
      quantity
    });

    await product.save();
    res.status(201).json({ success: true, message: 'পণ্য যোগ করা হয়েছে', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি' });
    }

    res.json({ success: true, message: 'পণ্য আপডেট হয়েছে', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি' });
    }

    res.json({ success: true, message: 'পণ্য মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add review to product
app.post('/api/products/:id/review', async (req, res) => {
  try {
    const { userId, userName, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি' });
    }

    const review = {
      userId,
      userName,
      rating,
      comment
    };

    product.reviews.push(review);

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();
    res.json({ success: true, message: 'রিভিউ যোগ করা হয়েছে', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USER ROUTES ====================

// Register user
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'ইমেইল ইতিমধ্যে নিবন্ধিত' });
    }

    const user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();
    res.status(201).json({ success: true, message: 'নিবন্ধন সফল', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }

    res.json({ success: true, message: 'লগইন সফল', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
    }

    res.json({ success: true, message: 'প্রোফাইল আপডেট হয়েছে', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDER ROUTES ====================

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, totalPrice, paymentMethod, deliveryAddress } = req.body;

    // Generate unique order ID
    const orderId = 'ORD' + Date.now();

    const order = new Order({
      orderId,
      userId,
      items,
      totalPrice,
      finalPrice: totalPrice + 100, // Adding delivery charge
      paymentMethod,
      deliveryAddress
    });

    await order.save();

    // Update product quantities
    for (let item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } }
      );
    }

    res.status(201).json({ success: true, message: 'অর্ডার তৈরি হয়েছে', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user orders
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, deliveredAt: status === 'Delivered' ? new Date() : null },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
    }

    res.json({ success: true, message: 'অর্ডার আপডেট হয়েছে', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== DASHBOARD/STATS ROUTES ====================

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'সার্ভার চলছে ✅' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌹 Flowers Shop Server চলছে: http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api\n`);
});
