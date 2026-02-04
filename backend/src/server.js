// server.js or app.js
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { networkInterfaces } from 'os'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import routes
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import contactRoutes from './routes/contact.js'
import newsletterRoutes from './routes/newsletter.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/upload.js'
import webhooksRoutes from './routes/webhooks.js'
import occasionsRoutes from './routes/occasions.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { initializeScheduledJobs } from './jobs/scheduledJobs.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Dynamic CORS configuration driven by environment variable FRONTEND_URLS
// FRONTEND_URLS can be a comma-separated list of allowed origins (e.g. https://app.example.com,http://localhost:5173)
const getAllowedOrigins = () => {
  const env = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
  if (!env) return ['http://localhost:5173'];
  return env.split(',').map(u => u.trim()).filter(Boolean);
}

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    // Allow server-to-server or curl requests with no origin
    if (!origin) return callback(null, true);
    if (allowed.includes('*') || allowed.includes(origin)) return callback(null, true);
    // For development, allow localhost with any port
    if (process.env.NODE_ENV !== 'production' && origin && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow access from the specified Origin.'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-Timestamp',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// Rate limiting - disabled in development to avoid blocking during testing
const limiter = process.env.NODE_ENV === 'production' ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}) : (req, res, next) => next() // Pass-through middleware in dev

// Middleware
app.use(helmet({
  // Use a safer default for cross origin resource policy
  crossOriginResourcePolicy: { policy: process.env.NODE_ENV === 'production' ? 'same-site' : 'cross-origin' },
  contentSecurityPolicy: false
}))
app.use(cors(corsOptions))
app.use(compression())
app.use(cookieParser())
  // Capture raw body for webhook signature verification
  app.use((req, res, next) => {
    if (req.path === '/api/webhooks/paystack') {
      let rawBody = ''
      req.on('data', chunk => {
        rawBody += chunk.toString()
      })
      req.on('end', () => {
        req.rawBody = rawBody
        next()
      })
    } else {
      next()
    }
  })
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('combined'))
app.use('/api/', limiter)


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Erica Spanks API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/webhooks', webhooksRoutes)
app.use('/api/occasions', occasionsRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    process.exit(1)
  }
}

// Get local IP address for mobile access
const getLocalIP = () => {
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        // Check if it's a local network IP (192.168.x.x, 10.x.x.x, 172.16.x.x - 172.31.x.x)
        if (net.address.startsWith('192.168.') || 
            net.address.startsWith('10.') || 
            net.address.startsWith('172.')) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
};

// Start server
const startServer = async () => {
  await connectDB()
  
  // Initialize scheduled background jobs
  initializeScheduledJobs()
  
  const localIP = getLocalIP();
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Erica Spanks API server running on port ${PORT}`)
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🏥 Health check: http://localhost:${PORT}/health`)
    console.log(`📱 Mobile access: http://${localIP}:${PORT}/health`)
    console.log(`🌐 Network URL: http://${localIP}:${PORT}`)
    // corsOptions.origin is a function; use getAllowedOrigins() for logging
    try {
      const allowedOrigins = getAllowedOrigins();
      console.log(`🔧 CORS enabled for: ${allowedOrigins.join(', ')}`)
    } catch (e) {
      console.log('🔧 CORS enabled (origins list unavailable)')
    }
      })

  return server
}

const server = startServer()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    mongoose.connection.close()
  })
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err)
  // Close server & exit process
  process.exit(1)
})