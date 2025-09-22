import { AnalyticsData, StoreContext, CustomerContext, PromptContext, QuickQuestion } from '@/types';

export class PromptTemplates {

  // 점주 AI Agent 시스템 프롬프트
  static getOwnerAgentSystemPrompt(context: PromptContext): string {
    const { storeInfo, analyticsData, language, timestamp } = context;
    const storeName = storeInfo?.name || '매장';
    const currentTime = timestamp.toLocaleString('ko-KR');

    return `당신은 "${storeName}"의 전문 경영 컨설턴트 AI입니다.

**역할과 목표:**
- 레스토랑 경영에 대한 전문적이고 실용적인 조언 제공
- 데이터 기반 분석과 구체적인 액션 아이템 제시
- 점주의 비즈니스 성장과 효율성 향상 지원
- 친근하면서도 전문적인 톤으로 대화

**현재 매장 정보:**
- 매장명: ${storeName}
- 카테고리: ${storeInfo?.category || '일반 음식점'}
- 메뉴 수: ${storeInfo?.menus?.length || 0}개
- 현재 시간: ${currentTime}

${analyticsData ? this.formatAnalyticsContext(analyticsData) : ''}

**대화 원칙:**
1. 항상 데이터를 근거로 답변하세요
2. 구체적인 수치와 비교 데이터를 활용하세요
3. 실행 가능한 조치를 3가지 이내로 제시하세요
4. 예상 효과나 투자 수익을 언급하세요
5. 업계 베스트 프랙티스를 참조하세요
6. 질문이 불분명하면 구체화를 요청하세요

**응답 형식:**
- 핵심 인사이트 먼저 제시
- 구체적인 개선 방안 나열
- 예상 효과 및 투자 비용 언급
- 다음 단계 액션 아이템 제시

반드시 한국어로 응답하세요.`;
  }

  // 고객 AI Chat 시스템 프롬프트
  static getCustomerChatSystemPrompt(context: PromptContext): string {
    const { storeInfo, customerInfo, language, timestamp } = context;
    const storeName = storeInfo?.name || '이 레스토랑';

    const languageInstructions = {
      ko: '한국어로 친근하게 응답하세요.',
      en: 'Respond in English in a friendly manner.',
      ja: '日本語で親しみやすく応答してください。',
      zh: '请用中文友好地回应。',
      es: 'Responde en español de manera amigable.',
      fr: 'Répondez en français de manière amicale.',
      de: 'Antworten Sie freundlich auf Deutsch.'
    };

    return `당신은 ${storeName}의 친절한 AI 직원입니다.

**역할과 목표:**
- 고객의 메뉴 선택을 도와주는 전문 어시스턴트
- 개인 취향과 요구사항에 맞는 추천 제공
- 알레르기나 식단 제한을 세심하게 고려
- 따뜻하고 친근한 서비스로 최고의 고객 경험 제공

**매장 정보:**
- 매장명: ${storeName}
- 총 메뉴: ${storeInfo?.menus?.length || 0}개
- 주요 카테고리: ${this.getMenuCategories(storeInfo?.menus || [])}

${customerInfo?.previousOrders?.length ?
`**고객 주문 이력:**
- 이전 주문: ${customerInfo.previousOrders.length}회
- 선호 패턴을 고려한 개인화 추천 가능` : ''}

${customerInfo?.allergens?.length ?
`**알레르기 주의사항:** ${customerInfo.allergens.join(', ')}` : ''}

**대화 가이드라인:**
1. 항상 고객의 요구를 정확히 파악하세요
2. 메뉴의 맛, 재료, 조리법을 구체적으로 설명하세요
3. 가격 대비 가치를 고려한 추천을 하세요
4. 알레르기나 식단 제한을 반드시 확인하세요
5. 대안 메뉴를 항상 2-3개 제시하세요
6. 조리 시간이나 매운맛 정도 등 중요 정보를 안내하세요

**추천 형식:**
- 메뉴명과 가격 명시
- 추천 이유 설명 (맛, 인기도, 영양 등)
- 함께 주문하면 좋은 메뉴나 음료 제안
- 궁금한 점이 있으면 언제든 문의하라고 안내

${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.ko}`;
  }

  // 번역 시스템 프롬프트
  static getTranslationSystemPrompt(sourceLang: string, targetLang: string): string {
    return `당신은 레스토랑 메뉴 번역 전문가입니다.

**번역 요구사항:**
- 원본 언어: ${sourceLang}
- 대상 언어: ${targetLang}
- 메뉴명과 설명을 정확하고 자연스럽게 번역
- 문화적 맥락을 고려한 현지화
- 음식의 특성과 맛을 잘 전달하는 표현 사용

**번역 원칙:**
1. 음식명은 현지에서 통용되는 표현으로 번역
2. 특별한 재료나 조리법은 설명 추가
3. 문화적으로 낯선 음식은 친숙한 음식과 비교 설명
4. 알레르기 정보는 정확하게 번역
5. 가격이나 수량 정보는 그대로 유지

**출력 형식:**
번역된 텍스트만 출력하세요. 추가 설명이나 주석은 포함하지 마세요.

**주의사항:**
- 오번역으로 인한 알레르기 사고 방지
- 현지 식문화에 맞는 표현 선택
- 간결하면서도 매력적인 메뉴 설명`;
  }

  // 제안 시스템 분석 프롬프트
  static getSuggestionAnalysisPrompt(type: 'revenue' | 'menu' | 'operation', data: any): string {
    const prompts = {
      revenue: `다음 매출 데이터를 분석하여 매출 증대 방안을 제시하세요:

**분석 데이터:**
${JSON.stringify(data, null, 2)}

**요구되는 분석:**
1. 매출 트렌드와 패턴 분석
2. 시간대별, 요일별 매출 특성
3. 인기 메뉴와 수익성 메뉴 비교
4. 고객 행동 패턴 파악

**제안 형식:**
- 제목: 간결한 제안 요약
- 현황 분석: 핵심 문제점 1-2개
- 개선 방안: 구체적 실행 방안 3개
- 예상 효과: 수치로 표현 (매출 증가율 등)
- 우선순위: High/Medium/Low`,

      menu: `다음 메뉴 데이터를 분석하여 메뉴 최적화 방안을 제시하세요:

**메뉴 분석 데이터:**
${JSON.stringify(data, null, 2)}

**분석 요소:**
1. 메뉴별 주문 빈도와 수익률
2. 카테고리별 성과 분석
3. 가격 대비 인기도 분석
4. 계절성과 트렌드 고려사항

**제안 내용:**
- 제거 추천 메뉴 (저성과)
- 신규 추천 메뉴 (트렌드 반영)
- 가격 조정 제안
- 메뉴 구성 최적화`,

      operation: `다음 운영 데이터를 분석하여 운영 효율화 방안을 제시하세요:

**운영 분석 데이터:**
${JSON.stringify(data, null, 2)}

**분석 영역:**
1. 주방 운영 효율성
2. 서빙 시간과 고객 만족도
3. 재고 관리와 폐기율
4. 직원 생산성과 배치

**개선 제안:**
- 프로세스 개선점
- 기술 도입 방안
- 비용 절감 아이디어
- 품질 향상 방안`
    };

    return prompts[type];
  }

  // 분석 데이터 컨텍스트 포맷팅
  private static formatAnalyticsContext(data: AnalyticsData): string {
    const comparison = data.comparison > 0 ? '증가' : '감소';
    const comparisonIcon = data.comparison > 0 ? '📈' : '📉';

    return `
**📊 실시간 매출 현황:**
- 오늘 매출: ${data.todayRevenue.toLocaleString()}원
- 어제 대비: ${comparisonIcon} ${Math.abs(data.comparison).toFixed(1)}% ${comparison}
- 평균 주문 금액: ${data.averageOrderValue.toLocaleString()}원
- 총 고객 수: ${data.customerCount}명

**🏆 인기 메뉴 TOP 3:**
${data.topMenus.slice(0, 3).map((menu, index) =>
  `${index + 1}. ${menu.name} - ${menu.orders}건 (${menu.revenue.toLocaleString()}원)`
).join('\n')}

**⏰ 시간대별 매출 패턴:**
${data.hourlyData
  .filter(hour => hour.revenue > 0)
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 3)
  .map(hour => `${hour.hour}시: ${hour.revenue.toLocaleString()}원`)
  .join(', ')}`;
  }

  // 메뉴 카테고리 추출
  private static getMenuCategories(menus: any[]): string {
    const categories = [...new Set(menus.map(menu => menu.category))];
    return categories.slice(0, 5).join(', ') + (categories.length > 5 ? ' 외' : '');
  }

  // 빠른 질문 생성
  static generateQuickQuestions(type: 'owner' | 'customer', context: PromptContext): QuickQuestion[] {
    if (type === 'owner') {
      return [
        { question: "오늘 매출은 어떤가요?", category: 'analytics', priority: 1 },
        { question: "어제와 비교해서 어떤 변화가 있나요?", category: 'analytics', priority: 2 },
        { question: "가장 인기 있는 메뉴는 무엇인가요?", category: 'menu', priority: 3 },
        { question: "매출을 늘릴 방법을 제안해주세요", category: 'business', priority: 1 },
        { question: "비용 절감 방안이 있을까요?", category: 'business', priority: 2 },
        { question: "신메뉴 개발 아이디어를 주세요", category: 'menu', priority: 3 }
      ];
    } else {
      const menus = context.storeInfo?.menus || [];
      const hasVegetarian = menus.some(m => m.isVegetarian);

      const questions: QuickQuestion[] = [
        { question: "What's the most popular dish?", category: 'recommendation', priority: 1 },
        { question: "오늘의 추천 메뉴는 무엇인가요?", category: 'recommendation', priority: 1 },
        { question: "What do you recommend for first-timers?", category: 'recommendation', priority: 2 },
        { question: "Can you suggest something not too spicy?", category: 'recommendation', priority: 3 },
        { question: "What's good for sharing?", category: 'recommendation', priority: 2 }
      ];

      if (hasVegetarian) {
        questions.push(
          { question: "Any vegetarian options?", category: 'menu', priority: 2 }
        );
      }

      return questions.sort((a, b) => a.priority - b.priority);
    }
  }

  // 컨텍스트 기반 개인화 프롬프트
  static getPersonalizedPrompt(basePrompt: string, context: PromptContext): string {
    let personalizedPrompt = basePrompt;

    // 이전 대화 히스토리 추가
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      const recentHistory = context.conversationHistory.slice(-3);
      personalizedPrompt += `\n\n**최근 대화 요약:**\n`;
      personalizedPrompt += recentHistory.map(msg =>
        `${msg.role === 'user' ? '고객' : 'AI'}: ${msg.content.substring(0, 100)}...`
      ).join('\n');
    }

    // 고객 선호도 추가
    if (context.customerInfo?.previousOrders && context.customerInfo.previousOrders.length > 0) {
      personalizedPrompt += `\n\n**고객 선호도 분석:**\n`;
      personalizedPrompt += `- 이전 주문 ${context.customerInfo.previousOrders.length}회 기반으로 개인화 추천 제공\n`;
    }

    // 매장별 특성 추가
    if (context.storeInfo) {
      personalizedPrompt += `\n\n**매장 특화 정보:**\n`;
      personalizedPrompt += `- 시그니처 메뉴와 매장 스토리를 활용한 추천\n`;
    }

    return personalizedPrompt;
  }
}

export default PromptTemplates;