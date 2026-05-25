import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_DEV_URL,
  'https://ware-pulse.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

// Remove trailing slashes for exact matches
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');

    // 1. Direct match check
    if (normalizedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // 2. Wildcard support for any local development port
    if (/^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // 3. Dynamic support for Vercel deployment preview domains (*.vercel.app)
    if (normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Clean CORS rejection without throwing crashing exceptions
    console.warn(`[CORS Audit] Request blocked from unauthorized origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-shop-id',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Backend running' });
});

app.use('/api/auth', authRoutes);

app.use(authMiddleware);

app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

app.use(errorHandler);

export default app;

