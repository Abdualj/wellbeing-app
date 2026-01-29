import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator';
import * as authController from '../controllers/auth.controller';
import { auditLog } from '../middleware/auditLog';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - consentGiven
 *               - dataProcessingConsent
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               displayName:
 *                 type: string
 *               consentGiven:
 *                 type: boolean
 *               dataProcessingConsent:
 *                 type: boolean
 */
router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('consentGiven').isBoolean().withMessage('Consent must be given'),
    body('dataProcessingConsent')
      .isBoolean()
      .withMessage('Data processing consent is required'),
  ]),
  auditLog('USER_REGISTER', 'User'),
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  auditLog('USER_LOGIN', 'User'),
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post(
  '/refresh',
  validate([body('refreshToken').notEmpty().withMessage('Refresh token is required')]),
  authController.refreshToken
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post(
  '/logout',
  validate([body('refreshToken').notEmpty().withMessage('Refresh token is required')]),
  authController.logout
);

export default router;
