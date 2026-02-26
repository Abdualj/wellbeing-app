import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  gdpr: {
    dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '730', 10),
    anonymizationDelayDays: parseInt(process.env.ANONYMIZATION_DELAY_DAYS || '30', 10),
  },
};
