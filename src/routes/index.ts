import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import groupRoutes from './group.routes';
import postRoutes from './post.routes';
import eventRoutes from './event.routes';
import healthRoutes from './health.routes';
import messageRoutes from './message.routes';
import debugRoutes from './debug.routes';

const router = Router();

// Health check routes
router.use('/', healthRoutes);

// Debug routes (only in development)
if (process.env.NODE_ENV === 'development') {
  router.use('/debug', debugRoutes);
}

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/groups', postRoutes);  // Group posts
router.use('/posts', postRoutes);   // Individual posts
router.use('/groups', eventRoutes); // Group events
router.use('/events', eventRoutes); // Individual events
router.use('/messages', messageRoutes); // Messages

export default router;
