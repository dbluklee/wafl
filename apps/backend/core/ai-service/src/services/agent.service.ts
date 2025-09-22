import { v4 as uuidv4 } from 'uuid';
import { OllamaStreamResponse, ChatRequest, ChatResponse, ConversationMessage } from '@/types';
import ollamaService from './ollama.service';
import contextService from './context.service';
import PromptTemplates from '@/utils/prompt-templates';
import logger, { aiLogger } from '@/utils/logger';
import { cache } from '@/utils/cache';

export class AgentService {
  // 점주 AI Agent 채팅
  async ownerChat(
    storeId: string,
    userId: string,
    chatRequest: ChatRequest,
    stream: boolean = true
  ): Promise<AsyncIterable<any> | ChatResponse> {
    const startTime = Date.now();

    try {
      aiLogger.chatRequest(chatRequest.sessionId, chatRequest.message, chatRequest.context);

      // 컨텍스트 구축
      const promptContext = await contextService.buildPromptContext(
        storeId,
        chatRequest.sessionId,
        undefined, // 점주 채팅에는 customerId 없음
        chatRequest.context?.includeAnalytics || false,
        chatRequest.context?.dateRange || 'today'
      );

      // 시스템 프롬프트 생성
      const systemPrompt = PromptTemplates.getOwnerAgentSystemPrompt(promptContext);

      // 대화 히스토리 가져오기
      const conversationHistory = contextService.getConversationHistory(chatRequest.sessionId, 5);

      // 대화 메시지 기록
      const userMessage: ConversationMessage = {
        id: uuidv4(),
        role: 'user',
        content: chatRequest.message,
        timestamp: new Date()
      };

      contextService.addMessageToSession(chatRequest.sessionId, userMessage);

      if (stream) {
        return this.streamOwnerChat(
          systemPrompt,
          conversationHistory,
          chatRequest.message,
          chatRequest.sessionId,
          storeId,
          startTime
        );
      } else {
        const response = await ollamaService.continueChat(
          systemPrompt,
          conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
          chatRequest.message,
          false
        ) as string;

        const processingTime = Date.now() - startTime;
        aiLogger.chatResponse(chatRequest.sessionId, response.length, processingTime);

        // AI 응답 기록
        const aiMessage: ConversationMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };

        contextService.addMessageToSession(chatRequest.sessionId, aiMessage);

        return {
          response,
          sessionId: chatRequest.sessionId,
          timestamp: new Date(),
          metadata: {
            processingTime,
            storeId,
            userId
          }
        };
      }
    } catch (error) {
      logger.error(`Owner chat error for store ${storeId}:`, error);
      throw new Error(`AI 채팅 처리 중 오류가 발생했습니다: ${(error as Error).message}`);
    }
  }

  // 스트리밍 점주 채팅
  private async *streamOwnerChat(
    systemPrompt: string,
    conversationHistory: ConversationMessage[],
    userMessage: string,
    sessionId: string,
    storeId: string,
    startTime: number
  ): AsyncIterable<any> {
    try {
      const stream = await ollamaService.continueChat(
        systemPrompt,
        conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
        userMessage,
        true
      ) as AsyncIterable<OllamaStreamResponse>;

      let accumulatedResponse = '';
      let chunkCount = 0;

      for await (const chunk of stream) {
        chunkCount++;

        if (chunk.message && chunk.message.content) {
          accumulatedResponse += chunk.message.content;

          yield {
            chunk: chunk.message.content,
            done: false,
            metadata: {
              chunkNumber: chunkCount,
              sessionId,
              storeId
            }
          };
        }

        if (chunk.done) {
          const processingTime = Date.now() - startTime;
          aiLogger.chatResponse(sessionId, accumulatedResponse.length, processingTime);

          // 완성된 AI 응답 기록
          const aiMessage: ConversationMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: accumulatedResponse,
            timestamp: new Date()
          };

          contextService.addMessageToSession(sessionId, aiMessage);

          yield {
            chunk: '',
            done: true,
            metadata: {
              totalChunks: chunkCount,
              processingTime,
              sessionId,
              storeId,
              responseLength: accumulatedResponse.length
            }
          };

          return;
        }
      }
    } catch (error) {
      logger.error(`Streaming owner chat error:`, error);
      yield {
        chunk: '',
        done: true,
        error: `스트리밍 중 오류가 발생했습니다: ${(error as Error).message}`
      };
    }
  }

  // 점주용 빠른 질문 생성
  async getOwnerQuickQuestions(storeId: string, userId: string): Promise<string[]> {
    const cacheKey = `quick-questions:owner:${storeId}`;

    // 캐시된 질문 확인
    let cachedQuestions = cache.getMedium<string[]>(cacheKey);
    if (cachedQuestions) {
      return cachedQuestions;
    }

    try {
      // 컨텍스트 기반 질문 생성
      const promptContext = await contextService.buildPromptContext(
        storeId,
        undefined,
        undefined,
        true // 분석 데이터 포함
      );

      const quickQuestions = PromptTemplates.generateQuickQuestions('owner', promptContext);
      const questions = quickQuestions.map(q => q.question);

      // 5분 캐시
      cache.setMedium(cacheKey, questions);

      logger.debug(`Generated ${questions.length} quick questions for owner ${userId}`);
      return questions;

    } catch (error) {
      logger.error(`Failed to generate owner quick questions:`, error);

      // 기본 질문 반환
      return [
        "오늘 매출은 어떤가요?",
        "어제와 비교해서 어떤 변화가 있나요?",
        "가장 인기 있는 메뉴는 무엇인가요?",
        "매출을 늘릴 방법을 제안해주세요",
        "비용 절감 방안이 있을까요?",
        "신메뉴 개발 아이디어를 주세요"
      ];
    }
  }

  // 대화 세션 생성 (점주용)
  createOwnerSession(storeId: string, userId: string): string {
    const session = contextService.createConversationSession(
      storeId,
      'owner',
      userId
    );

    logger.info(`Created owner session ${session.sessionId} for user ${userId} in store ${storeId}`);
    return session.sessionId;
  }

  // 세션 히스토리 조회
  async getSessionHistory(sessionId: string, limit: number = 20): Promise<ConversationMessage[]> {
    const history = contextService.getConversationHistory(sessionId, limit);

    logger.debug(`Retrieved ${history.length} messages for session ${sessionId}`);
    return history;
  }

  // 매장별 활성 세션 통계
  async getStoreSessionStats(storeId: string): Promise<{
    activeSessions: number;
    totalMessages: number;
    averageSessionLength: number;
  }> {
    const activeSessions = contextService.getActiveSessionCount(storeId);

    // 실제 구현에서는 데이터베이스나 더 정확한 통계 수집 필요
    return {
      activeSessions,
      totalMessages: 0, // 추후 구현
      averageSessionLength: 0 // 추후 구현
    };
  }

  // 비즈니스 인사이트 생성
  async generateBusinessInsights(
    storeId: string,
    type: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<{
    insights: string[];
    recommendations: string[];
    alerts: string[];
  }> {
    const cacheKey = `business-insights:${storeId}:${type}`;

    // 캐시 확인 (1시간)
    let cachedInsights = cache.getLong<any>(cacheKey);
    if (cachedInsights) {
      return cachedInsights;
    }

    try {
      // 분석 데이터 수집
      const analyticsContext = await contextService.getAnalyticsContext(storeId, type);
      const storeContext = await contextService.getStoreContext(storeId);

      if (!analyticsContext || !storeContext) {
        throw new Error('Required context data not available');
      }

      // AI를 통한 인사이트 생성
      const analysisPrompt = PromptTemplates.getSuggestionAnalysisPrompt('revenue', {
        analytics: analyticsContext,
        store: storeContext
      });

      const response = await ollamaService.singleChat(
        "당신은 레스토랑 비즈니스 분석 전문가입니다. 데이터를 분석하여 실용적인 인사이트와 추천사항을 제공하세요.",
        analysisPrompt,
        false
      ) as string;

      // 응답 파싱 및 구조화 (실제로는 더 정교한 파싱 로직 필요)
      const insights = this.parseBusinessInsights(response);

      // 1시간 캐시
      cache.setLong(cacheKey, insights);

      aiLogger.suggestionGenerated('business-insights', type, storeId);

      return insights;

    } catch (error) {
      logger.error(`Failed to generate business insights for store ${storeId}:`, error);

      return {
        insights: ['분석 데이터를 불러오는 중 문제가 발생했습니다.'],
        recommendations: ['잠시 후 다시 시도해 주세요.'],
        alerts: []
      };
    }
  }

  // 비즈니스 인사이트 파싱 (간단한 구현)
  private parseBusinessInsights(aiResponse: string): {
    insights: string[];
    recommendations: string[];
    alerts: string[];
  } {
    // 실제 구현에서는 더 정교한 NLP 파싱 또는 구조화된 AI 응답 필요
    const lines = aiResponse.split('\n').filter(line => line.trim());

    const insights: string[] = [];
    const recommendations: string[] = [];
    const alerts: string[] = [];

    let currentSection = 'insights';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.includes('추천') || trimmedLine.includes('권장') || trimmedLine.includes('제안')) {
        currentSection = 'recommendations';
      } else if (trimmedLine.includes('주의') || trimmedLine.includes('경고') || trimmedLine.includes('위험')) {
        currentSection = 'alerts';
      }

      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
        const cleanLine = trimmedLine.replace(/^[-•\d\.]\s*/, '').trim();

        if (cleanLine) {
          switch (currentSection) {
            case 'recommendations':
              recommendations.push(cleanLine);
              break;
            case 'alerts':
              alerts.push(cleanLine);
              break;
            default:
              insights.push(cleanLine);
          }
        }
      }
    }

    return { insights, recommendations, alerts };
  }

  // 대화 요약 생성
  async summarizeConversation(sessionId: string): Promise<string> {
    const history = contextService.getConversationHistory(sessionId, 20);

    if (history.length === 0) {
      return '대화 내용이 없습니다.';
    }

    try {
      const conversationText = history
        .map(msg => `${msg.role === 'user' ? '점주' : 'AI'}: ${msg.content}`)
        .join('\n');

      const summaryPrompt = `다음 점주와 AI의 대화를 3-5개의 핵심 포인트로 요약해주세요:

${conversationText}

요약 형식:
- 주요 질문과 관심사
- 제공된 조언과 분석
- 계획된 액션 아이템
- 추가 논의 필요사항`;

      const summary = await ollamaService.singleChat(
        "당신은 비즈니스 미팅 요약 전문가입니다. 대화의 핵심 내용을 간결하게 정리해주세요.",
        summaryPrompt,
        false
      ) as string;

      return summary;

    } catch (error) {
      logger.error(`Failed to summarize conversation ${sessionId}:`, error);
      return '대화 요약을 생성할 수 없습니다.';
    }
  }
}

export default new AgentService();