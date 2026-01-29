import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';
import logger from './config/logger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wellbeing App Backend API',
      version: '1.0.0',
      description: `
        Backend API for Wellbeing and Small-Group Community Application.
        
        **Project Context:**
        - Target: Young adults experiencing loneliness, stress, or need for social interaction
        - Approach: User-Centered Design (UCD)
        - Focus: Privacy, small closed groups, GDPR compliance
        
        **Features:**
        - Secure authentication with JWT
        - Small group management (4-12 members)
        - Group posts and comments
        - Event planning and participation
        - GDPR-compliant data handling
        - Privacy-first design
      `,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User profile and GDPR compliance endpoints',
      },
      {
        name: 'Groups',
        description: 'Small group management endpoints',
      },
      {
        name: 'Posts',
        description: 'Group posts and comments endpoints',
      },
      {
        name: 'Events',
        description: 'Event planning and participation endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Root welcome page
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Wellbeing App Backend API',
    version: '1.0.0',
    documentation: {
      swagger: `http://localhost:${config.port}/api-docs`,
      endpoints: `http://localhost:${config.port}/api/${config.apiVersion}`,
    },
    endpoints: {
      health: `/api/${config.apiVersion}/health`,
      auth: {
        register: `/api/${config.apiVersion}/auth/register`,
        login: `/api/${config.apiVersion}/auth/login`,
        refresh: `/api/${config.apiVersion}/auth/refresh`,
        logout: `/api/${config.apiVersion}/auth/logout`,
      },
      users: `/api/${config.apiVersion}/users`,
      groups: `/api/${config.apiVersion}/groups`,
      posts: `/api/${config.apiVersion}/posts`,
      events: `/api/${config.apiVersion}/events`,
    },
    testCredentials: [
      { email: 'alice@example.com', password: 'Password123!' },
      { email: 'bob@example.com', password: 'Password123!' },
      { email: 'carol@example.com', password: 'Password123!' },
    ],
    quickStart: {
      step1: 'Login to get an access token',
      step2: 'Use the token in Authorization header: Bearer YOUR_TOKEN',
      step3: 'Explore the API documentation at /api-docs',
    },
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use(`/api/${config.apiVersion}`, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
