import { Router } from 'express';
import { body, query, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import config from '@/config';

// Controllers
import agentController from '@/controllers/agent.controller';

// Middleware
import { authenticateToken, requireOwner } from '@/middlewares/auth.middleware';
import { validateRequest } from '@/middlewares/validation.middleware';

const router = Router();

// Rate limiting 설정
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: config.rateLimitEnabled ? 20 : 1000, // 분당 20회 (개발 중에는 제한 없음)
  message: {
    success: false,
    error: 'Too many requests. Please try again later.'
  }
});

const quickRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: config.rateLimitEnabled ? 60 : 1000, // 분당 60회
  message: {
    success: false,
    error: 'Too many requests. Please try again later.'
  }
});

// 점주 AI Agent 라우트
router.post('/agent/chat',
  chatRateLimit,
  authenticateToken,
  requireOwner,
  [
    body('sessionId').isUUID().withMessage('Valid session ID is required'),
    body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
    body('context').optional().isObject(),
    query('stream').optional().isBoolean()
  ],
  validateRequest,
  agentController.chat
);

router.get('/agent/quick-questions',
  quickRateLimit,
  authenticateToken,
  requireOwner,
  agentController.getQuickQuestions
);

router.get('/agent/sessions/:sessionId',
  quickRateLimit,
  authenticateToken,
  requireOwner,
  [
    param('sessionId').isUUID().withMessage('Valid session ID is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ],
  validateRequest,
  agentController.getSessionHistory
);

router.post('/agent/sessions',
  quickRateLimit,
  authenticateToken,
  requireOwner,
  agentController.createSession
);

router.get('/agent/insights',
  quickRateLimit,
  authenticateToken,
  requireOwner,
  [
    query('type').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Type must be daily, weekly, or monthly')
  ],
  validateRequest,
  agentController.getBusinessInsights
);

router.post('/agent/sessions/:sessionId/summary',
  quickRateLimit,
  authenticateToken,
  requireOwner,
  [
    param('sessionId').isUUID().withMessage('Valid session ID is required')
  ],
  validateRequest,
  agentController.summarizeConversation
);

export default router;