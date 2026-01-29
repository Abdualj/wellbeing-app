import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/info', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      name: 'Wellbeing App Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      apiVersion: process.env.API_VERSION || 'v1',
    },
  });
});

export default router;
