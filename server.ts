import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { patientRouter } from './src/server/routes/patientRoutes';
import { doctorRouter } from './src/server/routes/doctorRoutes';
import { departmentRouter } from './src/server/routes/departmentRoutes';
import { appointmentRouter } from './src/server/routes/appointmentRoutes';
import { dbRouter } from './src/server/routes/dbRoutes';
import { connectToMongo, getDbStatus } from './src/server/db/connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health & Database Status
  app.get('/api/health', async (_req, res) => {
    const dbStatus = await getDbStatus();
    res.json({
      status: 'healthy',
      app: 'Hospital Management System API',
      database: dbStatus,
      uptime: process.uptime(),
    });
  });

  app.get('/api/db-status', async (_req, res) => {
    const status = await getDbStatus();
    res.json({ success: true, data: status });
  });

  // Mount API Routers
  app.use('/api/patients', patientRouter);
  app.use('/api/doctors', doctorRouter);
  app.use('/api/departments', departmentRouter);
  app.use('/api/appointments', appointmentRouter);
  app.use('/api/db', dbRouter);

  // Development vs Production Frontend Serving
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware mounted');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`📦 Serving production build from ${distPath}`);
  }

  // Connect to MongoDB asynchronously
  connectToMongo().catch((err) => {
    console.warn('⚠️ Initial MongoDB connection attempt:', err?.message || err);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 Hospital Management Server running on http://0.0.0.0:${PORT}`);
    console.log(`🍃 MongoDB API endpoints ready at http://0.0.0.0:${PORT}/api/`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
