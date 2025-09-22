import { v4 as uuidv4 } from 'uuid';
import {
  ChatRequest,
  ChatResponse,
  ConversationMessage,
  MenuRecommendation,
  OllamaStreamResponse
} from '@/types';
import ollamaService from './ollama.service';
import contextService from './context.service';
import PromptTemplates from '@/utils/prompt-templates';
import logger, { aiLogger } from '@/utils/logger';
import { cache } from '@/utils/cache';

export class CustomerService {
  // 고객 AI 채팅
  async customerChat(
    storeId: string,
    chatRequest: ChatRequest,
    stream: boolean = false
  ): Promise<AsyncIterable<any> | ChatResponse> {
    const startTime = Date.now();

    try {
      aiLogger.chatRequest(chatRequest.sessionId, chatRequest.message, chatRequest.context);

      const customerId = chatRequest.context?.customerId;
      const language = chatRequest.context?.language || 'ko';

      // 컨텍스트 구축
      const promptContext = await contextService.buildPromptContext(
        storeId,
        chatRequest.sessionId,
        customerId,
        false, // 고객 채팅에는 분석 데이터 불필요
        'today'
      );

      // 언어 설정
      promptContext.language = language;

      // 시스템 프롬프트 생성
      const systemPrompt = PromptTemplates.getCustomerChatSystemPrompt(promptContext);

      // 대화 히스토리 가져오기
      const conversationHistory = contextService.getConversationHistory(chatRequest.sessionId, 5);

      // 대화 메시지 기록
      const userMessage: ConversationMessage = {
        id: uuidv4(),
        role: 'user',
        content: chatRequest.message,
        timestamp: new Date(),
        metadata: { customerId, language }
      };

      contextService.addMessageToSession(chatRequest.sessionId, userMessage);

      if (stream) {
        return this.streamCustomerChat(
          systemPrompt,
          conversationHistory,
          chatRequest.message,
          chatRequest.sessionId,
          storeId,
          customerId,
          language,
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
          timestamp: new Date(),
          metadata: { language }
        };

        contextService.addMessageToSession(chatRequest.sessionId, aiMessage);

        // 메뉴 추천 추출 (필요한 경우)
        const recommendations = await this.extractRecommendations(response, storeId, customerId);

        // 빠른 질문 생성
        const quickQuestions = await this.getCustomerQuickQuestions(storeId, language);

        return {
          response,
          sessionId: chatRequest.sessionId,
          timestamp: new Date(),
          recommendations,
          quickQuestions: quickQuestions.slice(0, 3),
          metadata: {
            processingTime,
            storeId,
            customerId,
            language
          }
        };
      }
    } catch (error) {
      logger.error(`Customer chat error for store ${storeId}:`, error);
      throw new Error(`AI 채팅 처리 중 오류가 발생했습니다: ${(error as Error).message}`);
    }
  }

  // 스트리밍 고객 채팅
  private async *streamCustomerChat(
    systemPrompt: string,
    conversationHistory: ConversationMessage[],
    userMessage: string,
    sessionId: string,
    storeId: string,
    customerId?: string,
    language: string = 'ko',
    startTime: number = Date.now()
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
              storeId,
              language
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
            timestamp: new Date(),
            metadata: { language }
          };

          contextService.addMessageToSession(sessionId, aiMessage);

          // 메뉴 추천과 빠른 질문 생성
          const [recommendations, quickQuestions] = await Promise.all([
            this.extractRecommendations(accumulatedResponse, storeId, customerId),
            this.getCustomerQuickQuestions(storeId, language)
          ]);

          yield {
            chunk: '',
            done: true,
            recommendations,
            quickQuestions: quickQuestions.slice(0, 3),
            metadata: {
              totalChunks: chunkCount,
              processingTime,
              sessionId,
              storeId,
              customerId,
              language,
              responseLength: accumulatedResponse.length
            }
          };

          return;
        }
      }
    } catch (error) {
      logger.error(`Streaming customer chat error:`, error);
      yield {
        chunk: '',
        done: true,
        error: `스트리밍 중 오류가 발생했습니다: ${(error as Error).message}`
      };
    }
  }

  // 메뉴 추천 생성
  async generateRecommendations(
    storeId: string,
    customerId?: string,
    preferences?: string[],
    budget?: number,
    numberOfPeople?: number
  ): Promise<MenuRecommendation[]> {
    try {
      const storeContext = await contextService.getStoreContext(storeId);
      const customerContext = customerId ?
        await contextService.getCustomerContext(customerId, storeId) : null;

      if (!storeContext) {
        logger.warn(`Store context not found for store ${storeId}`);
        return [];
      }

      // 고객 선호도 분석
      const customerPrefs = customerContext ?
        await contextService.analyzeMenuPreferences(customerId!, storeId) : {
          preferredCategories: [],
          allergens: [],
          priceRange: null,
          dietaryRestrictions: []
        };

      // 필터링 조건 설정
      let availableMenus = storeContext.menus.filter(menu => menu.isActive);

      // 알레르기 필터링
      if (customerPrefs.allergens.length > 0) {
        availableMenus = availableMenus.filter(menu =>
          !menu.allergens.some(allergen => customerPrefs.allergens.includes(allergen))
        );
      }

      // 식단 제한 필터링
      if (customerPrefs.dietaryRestrictions.includes('vegetarian')) {
        availableMenus = availableMenus.filter(menu => menu.isVegetarian);
      }
      if (customerPrefs.dietaryRestrictions.includes('vegan')) {
        availableMenus = availableMenus.filter(menu => menu.isVegan);
      }

      // 예산 필터링
      if (budget) {
        const maxPrice = numberOfPeople ? budget / numberOfPeople : budget;
        availableMenus = availableMenus.filter(menu => menu.price <= maxPrice);
      }

      // AI 기반 추천 생성
      const recommendationPrompt = this.buildRecommendationPrompt(
        availableMenus,
        customerPrefs,
        preferences,
        numberOfPeople
      );

      const aiRecommendation = await ollamaService.singleChat(
        "당신은 레스토랑 메뉴 추천 전문가입니다. 고객의 취향과 조건에 맞는 메뉴를 추천해주세요.",
        recommendationPrompt,
        false
      ) as string;

      // AI 응답에서 추천 메뉴 추출
      return this.parseRecommendations(aiRecommendation, availableMenus);

    } catch (error) {
      logger.error(`Failed to generate recommendations for store ${storeId}:`, error);
      return [];
    }
  }

  // 추천 프롬프트 생성
  private buildRecommendationPrompt(
    menus: any[],
    customerPrefs: any,
    preferences?: string[],
    numberOfPeople?: number
  ): string {
    const menuList = menus.map(menu =>
      `- ${menu.name}: ${menu.price.toLocaleString()}원 (${menu.category}, ${menu.description})`
    ).join('\n');

    return `다음 조건에 맞는 메뉴 3개를 추천해주세요:

**이용 가능한 메뉴:**
${menuList}

**고객 정보:**
${customerPrefs.preferredCategories.length > 0 ?
  `- 선호 카테고리: ${customerPrefs.preferredCategories.join(', ')}` : ''}
${customerPrefs.priceRange ?
  `- 가격 선호도: ${customerPrefs.priceRange.min.toLocaleString()}원 - ${customerPrefs.priceRange.max.toLocaleString()}원` : ''}
${preferences?.length ?
  `- 특별 요청: ${preferences.join(', ')}` : ''}
${numberOfPeople ?
  `- 인원 수: ${numberOfPeople}명` : ''}

**추천 형식:**
각 메뉴에 대해 다음 형식으로 답변:
메뉴명: [메뉴명]
추천 이유: [구체적인 이유]
신뢰도: [1-10점]

3개 메뉴만 선별해서 추천하세요.`;
  }

  // AI 응답에서 메뉴 추천 파싱
  private parseRecommendations(aiResponse: string, availableMenus: any[]): MenuRecommendation[] {
    const recommendations: MenuRecommendation[] = [];
    const lines = aiResponse.split('\n');

    let currentMenu: Partial<MenuRecommendation> = {};

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('메뉴명:') || trimmedLine.startsWith('Menu:')) {
        if (currentMenu.name) {
          // 이전 메뉴 완성
          this.completeRecommendation(currentMenu, availableMenus, recommendations);
        }

        currentMenu = {
          id: uuidv4(),
          name: trimmedLine.split(':')[1]?.trim() || '',
          reason: '',
          confidence: 0.5
        };
      } else if (trimmedLine.startsWith('추천 이유:') || trimmedLine.startsWith('Reason:')) {
        currentMenu.reason = trimmedLine.split(':')[1]?.trim() || '';
      } else if (trimmedLine.startsWith('신뢰도:') || trimmedLine.startsWith('Confidence:')) {
        const confidenceStr = trimmedLine.split(':')[1]?.trim();
        const confidence = parseInt(confidenceStr?.split('/')[0] || confidenceStr || '5');
        currentMenu.confidence = Math.min(confidence / 10, 1);
      }
    }

    // 마지막 메뉴 처리
    if (currentMenu.name) {
      this.completeRecommendation(currentMenu, availableMenus, recommendations);
    }

    return recommendations.slice(0, 3); // 최대 3개만 반환
  }

  // 추천 정보 완성
  private completeRecommendation(
    partial: Partial<MenuRecommendation>,
    availableMenus: any[],
    recommendations: MenuRecommendation[]
  ): void {
    const matchedMenu = availableMenus.find(menu =>
      menu.name === partial.name || menu.name.includes(partial.name?.substring(0, 5) || '')
    );

    if (matchedMenu && partial.name) {
      recommendations.push({
        id: matchedMenu.id,
        name: matchedMenu.name,
        description: matchedMenu.description || '',
        price: matchedMenu.price,
        category: matchedMenu.category,
        reason: partial.reason || '맛있는 메뉴입니다',
        confidence: partial.confidence || 0.7,
        allergens: matchedMenu.allergens,
        isVegetarian: matchedMenu.isVegetarian,
        isVegan: matchedMenu.isVegan
      });
    }
  }

  // AI 응답에서 메뉴 추천 추출
  private async extractRecommendations(
    response: string,
    storeId: string,
    customerId?: string
  ): Promise<MenuRecommendation[]> {
    // 간단한 키워드 기반 추천 추출
    // 실제로는 더 정교한 NLP 또는 구조화된 응답 처리 필요

    const menuKeywords = ['추천', 'recommend', '드세요', '어떠세요', '좋을 것 같아요'];
    const hasRecommendation = menuKeywords.some(keyword =>
      response.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasRecommendation) {
      return [];
    }

    // 컨텍스트 기반 추천 생성
    return this.generateRecommendations(storeId, customerId);
  }

  // 고객용 빠른 질문 생성
  async getCustomerQuickQuestions(storeId: string, language: string = 'ko'): Promise<string[]> {
    const cacheKey = `quick-questions:customer:${storeId}:${language}`;

    // 캐시된 질문 확인
    let cachedQuestions = cache.getMedium<string[]>(cacheKey);
    if (cachedQuestions) {
      return cachedQuestions;
    }

    try {
      const promptContext = await contextService.buildPromptContext(storeId);
      const quickQuestions = PromptTemplates.generateQuickQuestions('customer', promptContext);

      let questions = quickQuestions.map(q => q.question);

      // 언어별 질문 필터링/번역
      if (language === 'en') {
        questions = questions.filter(q => q.includes('What') || q.includes('Any') || q.includes('Can'));

        if (questions.length < 3) {
          questions.push(
            "What's your signature dish?",
            "Any lunch specials today?",
            "What's the chef's recommendation?"
          );
        }
      }

      questions = questions.slice(0, 6); // 최대 6개

      // 5분 캐시
      cache.setMedium(cacheKey, questions);

      logger.debug(`Generated ${questions.length} quick questions for customers (${language})`);
      return questions;

    } catch (error) {
      logger.error(`Failed to generate customer quick questions:`, error);

      // 언어별 기본 질문
      const defaultQuestions = {
        ko: [
          "오늘의 추천 메뉴는 무엇인가요?",
          "인기 메뉴 추천해주세요",
          "맵지 않은 메뉴 있나요?",
          "2명이 먹기 좋은 메뉴는?",
          "채식 메뉴도 있나요?",
          "가격대별 추천 메뉴는?"
        ],
        en: [
          "What's the most popular dish?",
          "Any vegetarian options?",
          "What do you recommend for first-timers?",
          "Can you suggest something not too spicy?",
          "What's good for sharing?",
          "Any lunch specials today?"
        ]
      };

      return defaultQuestions[language as keyof typeof defaultQuestions] || defaultQuestions.ko;
    }
  }

  // 고객 세션 생성
  createCustomerSession(storeId: string, customerId?: string): string {
    const session = contextService.createConversationSession(
      storeId,
      'customer',
      undefined, // userId는 null
      customerId
    );

    logger.info(`Created customer session ${session.sessionId} for store ${storeId}${customerId ? `, customer ${customerId}` : ''}`);
    return session.sessionId;
  }

  // 고객 만족도 피드백 분석
  async analyzeFeedback(
    storeId: string,
    feedbacks: Array<{ rating: number; comment: string; timestamp: Date }>
  ): Promise<{
    overallSentiment: 'positive' | 'neutral' | 'negative';
    keyInsights: string[];
    improvementAreas: string[];
    averageRating: number;
  }> {
    if (feedbacks.length === 0) {
      return {
        overallSentiment: 'neutral',
        keyInsights: ['분석할 피드백이 없습니다.'],
        improvementAreas: [],
        averageRating: 0
      };
    }

    try {
      const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
      const overallSentiment = averageRating >= 4 ? 'positive' :
                              averageRating >= 3 ? 'neutral' : 'negative';

      const feedbackText = feedbacks
        .map(f => `평점 ${f.rating}/5: ${f.comment}`)
        .join('\n');

      const analysisPrompt = `다음 고객 피드백을 분석해주세요:

${feedbackText}

분석 결과를 다음 형식으로 제공해주세요:
1. 주요 인사이트 (3개)
2. 개선 필요 영역 (3개)

각 항목은 한 줄로 간결하게 작성하세요.`;

      const analysisResult = await ollamaService.singleChat(
        "당신은 고객 피드백 분석 전문가입니다. 피드백을 분석하여 인사이트와 개선점을 도출해주세요.",
        analysisPrompt,
        false
      ) as string;

      const { keyInsights, improvementAreas } = this.parseFeedbackAnalysis(analysisResult);

      return {
        overallSentiment,
        keyInsights,
        improvementAreas,
        averageRating: Math.round(averageRating * 10) / 10
      };

    } catch (error) {
      logger.error(`Failed to analyze feedback for store ${storeId}:`, error);

      return {
        overallSentiment: 'neutral',
        keyInsights: ['피드백 분석 중 오류가 발생했습니다.'],
        improvementAreas: ['시스템 안정성 개선 필요'],
        averageRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      };
    }
  }

  // 피드백 분석 결과 파싱
  private parseFeedbackAnalysis(analysisResult: string): {
    keyInsights: string[];
    improvementAreas: string[];
  } {
    const lines = analysisResult.split('\n').filter(line => line.trim());
    const keyInsights: string[] = [];
    const improvementAreas: string[] = [];

    let currentSection = 'insights';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.includes('개선') || trimmedLine.includes('improvement')) {
        currentSection = 'improvements';
      }

      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
        const cleanLine = trimmedLine.replace(/^[-•\d\.]\s*/, '').trim();

        if (cleanLine) {
          if (currentSection === 'improvements') {
            improvementAreas.push(cleanLine);
          } else {
            keyInsights.push(cleanLine);
          }
        }
      }
    }

    return { keyInsights, improvementAreas };
  }
}

export default new CustomerService();