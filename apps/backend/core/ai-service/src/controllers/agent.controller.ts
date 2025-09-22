import { Response } from 'express';
import { AuthenticatedRequest, ChatRequest } from '@/types';
import agentService from '@/services/agent.service';
import logger from '@/utils/logger';

export class AgentController {
  // 점주 AI 채팅
  async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId, message, context } = req.body as ChatRequest;
      const { storeId, id: userId } = req.user!;
      const stream = req.query.stream === 'true';

      if (stream) {
        // SSE 스트리밍 설정
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const chatStream = await agentService.ownerChat(
          storeId,
          userId,
          { sessionId, message, context },
          true
        ) as AsyncIterable<any>;

        try {
          for await (const chunk of chatStream) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);

            if (chunk.done) {
              break;
            }
          }
        } catch (streamError) {
          res.write(`data: ${JSON.stringify({ error: 'Streaming error', done: true })}\n\n`);
        } finally {
          res.end();
        }
      } else {
        const response = await agentService.ownerChat(
          storeId,
          userId,
          { sessionId, message, context },
          false
        );

        res.json({ success: true, data: response });
      }
    } catch (error) {
      logger.error('Agent chat error:', error);

      if (req.query.stream === 'true') {
        res.write(`data: ${JSON.stringify({ error: (error as Error).message, done: true })}\n\n`);
        res.end();
      } else {
        res.status(500).json({
          success: false,
          error: (error as Error).message
        });
      }
    }
  }

  // 빠른 질문 조회
  async getQuickQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId, id: userId } = req.user!;

      const questions = await agentService.getOwnerQuickQuestions(storeId, userId);

      res.json({
        success: true,
        data: { questions }
      });
    } catch (error) {
      logger.error('Get quick questions error:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // 세션 히스토리 조회
  async getSessionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const history = await agentService.getSessionHistory(sessionId, limit);

      res.json({
        success: true,
        data: { sessionId, messages: history }
      });
    } catch (error) {
      logger.error('Get session history error:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // 새 세션 생성
  async createSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId, id: userId } = req.user!;

      const sessionId = agentService.createOwnerSession(storeId, userId);

      res.json({
        success: true,
        data: { sessionId }
      });
    } catch (error) {
      logger.error('Create session error:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // 비즈니스 인사이트 생성
  async getBusinessInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const type = (req.query.type as 'daily' | 'weekly' | 'monthly') || 'daily';

      const insights = await agentService.generateBusinessInsights(storeId, type);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Get business insights error:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // 대화 요약
  async summarizeConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const summary = await agentService.summarizeConversation(sessionId);

      res.json({
        success: true,
        data: { sessionId, summary }
      });
    } catch (error) {
      logger.error('Summarize conversation error:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default new AgentController();