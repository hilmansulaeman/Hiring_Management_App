import "dotenv/config";
import express from "express";
import cors from "cors";
import demoRoutes from './routes/demo';
import jobsRoutes from './routes/jobs';
import candidatesRoutes from './routes/candidates';
import { createApplication, listApplications } from './controllers/applications';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' })); // Increase limit for large payloads like image data
  app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Also increase for urlencoded

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.use('/api/demo', demoRoutes);
  app.use('/api/jobs', jobsRoutes);
  app.use('/api/candidates', candidatesRoutes);

  // Application routes
  app.post('/api/jobs/:jobId/applications', createApplication);
  app.get('/api/jobs/:jobId/applications', listApplications);

  return app;
}
