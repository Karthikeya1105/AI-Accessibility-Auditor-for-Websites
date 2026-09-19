import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRoutes from './routes/scan.routes.js';
import reportRoutes from './routes/report.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'AI Accessibility Auditor API',
    groqEnabled: Boolean(process.env.GROQ_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/report', reportRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Accessibility Auditor Server running on port ${PORT}`);
  console.log(`🤖 Groq AI Engine: ${process.env.GROQ_API_KEY ? 'ACTIVE (GROQ_API_KEY detected)' : 'INACTIVE (Using template fallback)'}`);
  console.log(`====================================================`);
});
