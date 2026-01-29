import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import groupRoutes from './group.routes';
import postRoutes from './post.routes';
import eventRoutes from './event.routes';
import healthRoutes from './health.routes';

const router = Router();

// Health check routes
router.use('/', healthRoutes);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/groups', postRoutes);  // Group posts
router.use('/posts', postRoutes);   // Individual posts
router.use('/groups', eventRoutes); // Group events
router.use('/events', eventRoutes); // Individual events

export default router;
