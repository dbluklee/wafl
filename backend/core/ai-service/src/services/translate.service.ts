import { TranslationRequest, TranslationResponse } from '@/types';
import ollamaService from './ollama.service';
import contextService from './context.service';
import PromptTemplates from '@/utils/prompt-templates';
import logger, { aiLogger } from '@/utils/logger';
import { cache } from '@/utils/cache';

export class TranslateService {
  private readonly supportedLanguages = {
    'ko': '한국어',
    'en': 'English',
    'ja': '日本語',
    'zh': '中文',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'ru': 'Русский',
    'th': 'ไทย',
    'vi': 'Tiếng Việt'
  };

  // 텍스트 번역
  async translateText(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslationResponse> {
    const startTime = Date.now();

    try {
      aiLogger.translationRequest(text, sourceLang || 'auto', targetLang);

      // 언어 코드 검증
      if (!this.supportedLanguages[targetLang as keyof typeof this.supportedLanguages]) {
        throw new Error(`Unsupported target language: ${targetLang}`);
      }

      // 원본과 대상 언어가 같으면 바로 반환
      if (sourceLang === targetLang) {
        return {
          originalText: text,
          translatedText: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
          confidence: 1.0
        };
      }

      // 캐시 키 생성
      const cacheKey = `translation:${this.hashText(text)}:${sourceLang || 'auto'}:${targetLang}`;

      // 캐시된 번역 확인
      let cachedTranslation = cache.getLong<TranslationResponse>(cacheKey);
      if (cachedTranslation) {
        logger.debug(`Translation cache hit for ${sourceLang || 'auto'} -> ${targetLang}`);
        return cachedTranslation;
      }

      // 언어 자동 감지 (필요한 경우)
      const detectedSourceLang = sourceLang || await this.detectLanguage(text);

      // 번역 프롬프트 생성
      const systemPrompt = PromptTemplates.getTranslationSystemPrompt(
        detectedSourceLang,
        targetLang
      );

      const translationPrompt = `다음 텍스트를 번역하세요:

원본 텍스트: "${text}"

번역 요구사항:
- 원본 언어: ${this.supportedLanguages[detectedSourceLang as keyof typeof this.supportedLanguages] || detectedSourceLang}
- 대상 언어: ${this.supportedLanguages[targetLang as keyof typeof this.supportedLanguages]}
- 음식점 메뉴/서비스 관련 번역
- 자연스럽고 정확한 번역 제공

번역된 텍스트만 출력하세요.`;

      const translatedText = await ollamaService.singleChat(
        systemPrompt,
        translationPrompt,
        false
      ) as string;

      // 번역 품질 평가
      const confidence = await this.evaluateTranslationQuality(
        text,
        translatedText.trim(),
        detectedSourceLang,
        targetLang
      );

      const result: TranslationResponse = {
        originalText: text,
        translatedText: translatedText.trim(),
        sourceLang: detectedSourceLang,
        targetLang: targetLang,
        confidence: confidence
      };

      // 문화적 노트 추가 (특정 언어 쌍에 대해)
      if (this.needsCulturalNotes(detectedSourceLang, targetLang)) {
        result.culturalNotes = await this.generateCulturalNotes(text, detectedSourceLang, targetLang);
      }

      // 캐시 저장 (1시간)
      cache.setLong(cacheKey, result);

      const processingTime = Date.now() - startTime;
      logger.debug(`Translation completed in ${processingTime}ms: ${detectedSourceLang} -> ${targetLang}`);

      return result;

    } catch (error) {
      logger.error(`Translation error:`, error);
      throw new Error(`번역 처리 중 오류가 발생했습니다: ${(error as Error).message}`);
    }
  }

  // 메뉴 번역
  async translateMenu(
    storeId: string,
    menuId: string,
    targetLang: string,
    includeAllergens: boolean = true,
    includeDescription: boolean = true
  ): Promise<{
    menuId: string;
    originalName: string;
    translatedName: string;
    originalDescription?: string;
    translatedDescription?: string;
    allergens?: string[];
    culturalNotes?: string[];
  }> {
    try {
      // 매장 컨텍스트에서 메뉴 정보 가져오기
      const storeContext = await contextService.getStoreContext(storeId);
      if (!storeContext) {
        throw new Error(`Store not found: ${storeId}`);
      }

      const menu = storeContext.menus.find(m => m.id === menuId);
      if (!menu) {
        throw new Error(`Menu not found: ${menuId}`);
      }

      // 메뉴명 번역
      const nameTranslation = await this.translateText(menu.name, targetLang, 'ko');

      let descTranslation: TranslationResponse | undefined;
      if (includeDescription && menu.description) {
        descTranslation = await this.translateText(menu.description, targetLang, 'ko');
      }

      // 알레르기 정보 번역
      let translatedAllergens: string[] | undefined;
      if (includeAllergens && menu.allergens && menu.allergens.length > 0) {
        translatedAllergens = await Promise.all(
          menu.allergens.map(allergen =>
            this.translateText(allergen, targetLang, 'ko').then(t => t.translatedText)
          )
        );
      }

      return {
        menuId: menu.id,
        originalName: menu.name,
        translatedName: nameTranslation.translatedText,
        originalDescription: menu.description,
        translatedDescription: descTranslation?.translatedText,
        allergens: translatedAllergens,
        culturalNotes: nameTranslation.culturalNotes
      };

    } catch (error) {
      logger.error(`Menu translation error for menu ${menuId}:`, error);
      throw error;
    }
  }

  // 대량 번역
  async translateBatch(
    items: string[],
    targetLang: string,
    sourceLang?: string
  ): Promise<Array<{
    original: string;
    translated: string;
    confidence: number;
  }>> {
    const batchSize = 5; // 동시 처리할 번역 수
    const results: Array<{
      original: string;
      translated: string;
      confidence: number;
    }> = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchPromises = batch.map(async (item) => {
        try {
          const translation = await this.translateText(item, targetLang, sourceLang);
          return {
            original: item,
            translated: translation.translatedText,
            confidence: translation.confidence
          };
        } catch (error) {
          logger.warn(`Failed to translate item: "${item}"`, error);
          return {
            original: item,
            translated: item, // 실패 시 원본 반환
            confidence: 0
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // API 호출량 제한을 위한 지연
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logger.info(`Batch translation completed: ${results.length} items (${sourceLang || 'auto'} -> ${targetLang})`);
    return results;
  }

  // 전체 매장 메뉴 번역
  async translateStoreMenus(
    storeId: string,
    targetLang: string,
    includeDescriptions: boolean = true
  ): Promise<{
    storeId: string;
    targetLanguage: string;
    totalMenus: number;
    translatedMenus: Array<{
      id: string;
      originalName: string;
      translatedName: string;
      originalDescription?: string;
      translatedDescription?: string;
      category: string;
      price: number;
    }>;
    failedTranslations: string[];
  }> {
    try {
      const storeContext = await contextService.getStoreContext(storeId);
      if (!storeContext) {
        throw new Error(`Store not found: ${storeId}`);
      }

      const activeMenus = storeContext.menus.filter(menu => menu.isActive);
      const translatedMenus: any[] = [];
      const failedTranslations: string[] = [];

      // 메뉴명 일괄 번역
      const menuNames = activeMenus.map(menu => menu.name);
      const nameTranslations = await this.translateBatch(menuNames, targetLang, 'ko');

      // 설명 일괄 번역 (포함하는 경우)
      let descTranslations: Array<{ original: string; translated: string; confidence: number }> = [];
      if (includeDescriptions) {
        const descriptions = activeMenus
          .filter(menu => menu.description)
          .map(menu => menu.description!);

        if (descriptions.length > 0) {
          descTranslations = await this.translateBatch(descriptions, targetLang, 'ko');
        }
      }

      // 결과 조합
      for (let i = 0; i < activeMenus.length; i++) {
        const menu = activeMenus[i];
        const nameTranslation = nameTranslations[i];

        if (nameTranslation && nameTranslation.confidence > 0.3) {
          const descTranslation = includeDescriptions && menu.description ?
            descTranslations.find(d => d.original === menu.description) : undefined;

          translatedMenus.push({
            id: menu.id,
            originalName: menu.name,
            translatedName: nameTranslation.translated,
            originalDescription: menu.description,
            translatedDescription: descTranslation?.translated,
            category: menu.category,
            price: menu.price
          });
        } else {
          failedTranslations.push(menu.name);
        }
      }

      logger.info(`Store menu translation completed: ${translatedMenus.length}/${activeMenus.length} menus (${targetLang})`);

      return {
        storeId,
        targetLanguage: targetLang,
        totalMenus: activeMenus.length,
        translatedMenus,
        failedTranslations
      };

    } catch (error) {
      logger.error(`Store menu translation error for store ${storeId}:`, error);
      throw error;
    }
  }

  // 언어 감지
  private async detectLanguage(text: string): Promise<string> {
    // 간단한 언어 감지 로직
    // 실제로는 더 정교한 언어 감지 라이브러리나 AI 모델 사용 권장

    const koreanPattern = /[가-힣]/;
    const chinesePattern = /[\u4e00-\u9fff]/;
    const japanesePattern = /[ひらがなカタカナ]/;
    const thaiPattern = /[\u0e00-\u0e7f]/;
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

    if (koreanPattern.test(text)) return 'ko';
    if (chinesePattern.test(text)) return 'zh';
    if (japanesePattern.test(text)) return 'ja';
    if (thaiPattern.test(text)) return 'th';
    if (vietnamesePattern.test(text)) return 'vi';

    // 기본적으로 영어로 가정
    return 'en';
  }

  // 번역 품질 평가
  private async evaluateTranslationQuality(
    original: string,
    translated: string,
    sourceLang: string,
    targetLang: string
  ): Promise<number> {
    // 간단한 품질 평가 로직
    // 실제로는 BLEU 점수나 다른 메트릭 사용 권장

    try {
      // 길이 비율 체크
      const lengthRatio = translated.length / original.length;
      if (lengthRatio < 0.3 || lengthRatio > 3.0) {
        return 0.4; // 길이가 너무 다르면 품질 낮음
      }

      // 빈 번역이나 동일한 번역 체크
      if (!translated.trim() || translated.trim() === original.trim()) {
        return 0.2;
      }

      // 특수 문자만 있는 경우
      if (/^[^a-zA-Z가-힣\u4e00-\u9fff]+$/.test(translated.trim())) {
        return 0.3;
      }

      // 기본 품질 점수
      return 0.8;

    } catch (error) {
      logger.warn('Translation quality evaluation failed:', error);
      return 0.5;
    }
  }

  // 문화적 노트가 필요한지 확인
  private needsCulturalNotes(sourceLang: string, targetLang: string): boolean {
    const culturallyDistantPairs = [
      ['ko', 'en'], ['ko', 'es'], ['ko', 'fr'], ['ko', 'de'],
      ['ja', 'en'], ['ja', 'es'], ['ja', 'fr'], ['ja', 'de'],
      ['zh', 'en'], ['zh', 'es'], ['zh', 'fr'], ['zh', 'de']
    ];

    return culturallyDistantPairs.some(pair =>
      (pair[0] === sourceLang && pair[1] === targetLang) ||
      (pair[1] === sourceLang && pair[0] === targetLang)
    );
  }

  // 문화적 노트 생성
  private async generateCulturalNotes(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string[]> {
    try {
      const prompt = `다음 음식 관련 텍스트에 대해 ${sourceLang}에서 ${targetLang}로 번역할 때 필요한 문화적 설명이나 노트가 있다면 제공해주세요:

텍스트: "${text}"

문화적 차이점이나 추가 설명이 필요한 부분이 있다면 간단히 설명해주세요. 없다면 "없음"이라고 답변하세요.`;

      const response = await ollamaService.singleChat(
        "당신은 문화 번역 전문가입니다. 음식 문화의 차이점을 설명해주세요.",
        prompt,
        false
      ) as string;

      if (response.includes('없음') || response.length < 10) {
        return [];
      }

      return [response.trim()];

    } catch (error) {
      logger.warn('Failed to generate cultural notes:', error);
      return [];
    }
  }

  // 텍스트 해시 생성 (캐시 키용)
  private hashText(text: string): string {
    // 간단한 해시 함수 (실제로는 crypto 모듈 사용 권장)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36);
  }

  // 지원 언어 목록 조회
  getSupportedLanguages(): { [key: string]: string } {
    return { ...this.supportedLanguages };
  }

  // 번역 통계 조회
  async getTranslationStats(storeId?: string): Promise<{
    totalTranslations: number;
    languagePairs: { [key: string]: number };
    averageConfidence: number;
    cacheHitRate: number;
  }> {
    try {
      const cacheStats = cache.getStats();

      // 실제 구현에서는 데이터베이스에서 통계 조회
      return {
        totalTranslations: 0, // DB에서 조회
        languagePairs: {}, // DB에서 조회
        averageConfidence: 0.75, // DB에서 계산
        cacheHitRate: cacheStats.long.hitRate
      };

    } catch (error) {
      logger.error('Failed to get translation stats:', error);
      return {
        totalTranslations: 0,
        languagePairs: {},
        averageConfidence: 0,
        cacheHitRate: 0
      };
    }
  }

  // 캐시 정리
  clearTranslationCache(pattern?: string): number {
    const cachePattern = pattern || 'translation:.*';
    return cache.invalidateByPattern(cachePattern);
  }
}

export default new TranslateService();