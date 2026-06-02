// Backend Configuration for Flowers Shop
require('dotenv').config();

module.exports = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/flowers-shop',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
    expiresIn: '7d'
  },

  // Email Configuration (Nodemailer)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@flowersshop.bd'
  },

  // Payment Gateway Configuration
  payment: {
    stripe: {
      apiKey: process.env.STRIPE_API_KEY,
      publicKey: process.env.STRIPE_PUBLIC_KEY
    },
    bkash: {
      apiKey: process.env.BKASH_API_KEY,
      secretKey: process.env.BKASH_SECRET_KEY,
      appKey: process.env.BKASH_APP_KEY
    }
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
    uploadDir: 'uploads/'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
};
