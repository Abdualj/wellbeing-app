import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Debug endpoint to check user memberships
router.get('/memberships', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        group: { select: { name: true, id: true } }
      },
      orderBy: { joinedAt: 'desc' }
    });

    res.json({
      userId,
      totalMemberships: memberships.length,
      memberships: memberships.map(m => ({
        groupId: m.groupId,
        groupName: m.group.name,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memberships' });
  }
});

export default router;
