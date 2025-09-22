import axios, { AxiosResponse } from 'axios';
import config from '@/config';
import { OllamaMessage, OllamaResponse, OllamaStreamResponse } from '@/types';
import logger, { aiLogger } from '@/utils/logger';

export class OllamaService {
  private baseURL: string;
  private model: string;

  constructor() {
    this.baseURL = config.ollama.baseUrl;
    this.model = config.ollama.model;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });

      const models = response.data.models || [];
      const isModelAvailable = models.some((m: any) => m.name === this.model);

      if (!isModelAvailable) {
        logger.warn(`Model ${this.model} not available in Ollama server`);
        return false;
      }

      logger.debug('Ollama health check passed');
      return true;
    } catch (error) {
      aiLogger.ollamaError('health-check', error as Error);
      return false;
    }
  }

  async chat(messages: OllamaMessage[], stream: boolean = false): Promise<AsyncIterable<OllamaStreamResponse> | OllamaResponse> {
    const startTime = Date.now();

    try {
      aiLogger.ollamaRequest('chat', this.model, messages.reduce((total, msg) => total + msg.content.length, 0));

      const requestBody = {
        model: this.model,
        messages: messages,
        stream: stream,
        options: {
          temperature: config.ollama.temperature,
          top_p: config.ollama.topP,
          num_predict: config.ollama.maxTokens
        }
      };

      if (stream) {
        return this.streamChat(requestBody);
      } else {
        const response = await axios.post(`${this.baseURL}/api/chat`, requestBody, {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const processingTime = Date.now() - startTime;
        logger.debug(`Ollama chat response received in ${processingTime}ms`);

        return response.data as OllamaResponse;
      }
    } catch (error) {
      aiLogger.ollamaError('chat', error as Error);
      throw new Error(`Ollama API error: ${(error as any).message}`);
    }
  }

  async *streamChat(requestBody: any): AsyncIterable<OllamaStreamResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/chat`, requestBody, {
        responseType: 'stream',
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let buffer = '';

      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');

        // 마지막 불완전한 라인은 버퍼에 유지
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line) as OllamaStreamResponse;
              yield data;

              if (data.done) {
                return;
              }
            } catch (parseError) {
              logger.warn(`Failed to parse stream chunk: ${line}`);
            }
          }
        }
      }

      // 남은 버퍼 처리
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer) as OllamaStreamResponse;
          yield data;
        } catch (parseError) {
          logger.warn(`Failed to parse final buffer: ${buffer}`);
        }
      }
    } catch (error) {
      aiLogger.ollamaError('stream-chat', error as Error);
      throw new Error(`Ollama streaming error: ${(error as any).message}`);
    }
  }

  async generate(prompt: string, stream: boolean = false): Promise<string | AsyncIterable<string>> {
    const startTime = Date.now();

    try {
      aiLogger.ollamaRequest('generate', this.model, prompt.length);

      const requestBody = {
        model: this.model,
        prompt: prompt,
        stream: stream,
        options: {
          temperature: config.ollama.temperature,
          top_p: config.ollama.topP,
          num_predict: config.ollama.maxTokens
        }
      };

      if (stream) {
        return this.streamGenerate(requestBody);
      } else {
        const response = await axios.post(`${this.baseURL}/api/generate`, requestBody, {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const processingTime = Date.now() - startTime;
        logger.debug(`Ollama generate response received in ${processingTime}ms`);

        return response.data.response;
      }
    } catch (error) {
      aiLogger.ollamaError('generate', error as Error);
      throw new Error(`Ollama API error: ${(error as any).message}`);
    }
  }

  async *streamGenerate(requestBody: any): AsyncIterable<string> {
    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, requestBody, {
        responseType: 'stream',
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let buffer = '';

      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');

        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield data.response;
              }

              if (data.done) {
                return;
              }
            } catch (parseError) {
              logger.warn(`Failed to parse generate chunk: ${line}`);
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.response) {
            yield data.response;
          }
        } catch (parseError) {
          logger.warn(`Failed to parse final generate buffer: ${buffer}`);
        }
      }
    } catch (error) {
      aiLogger.ollamaError('stream-generate', error as Error);
      throw new Error(`Ollama streaming error: ${(error as any).message}`);
    }
  }

  async embeddings(text: string): Promise<number[]> {
    try {
      aiLogger.ollamaRequest('embeddings', this.model, text.length);

      const response = await axios.post(`${this.baseURL}/api/embeddings`, {
        model: this.model,
        prompt: text
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.embedding;
    } catch (error) {
      aiLogger.ollamaError('embeddings', error as Error);
      throw new Error(`Ollama embeddings error: ${(error as any).message}`);
    }
  }

  async getModelInfo(): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/api/show`, {
        name: this.model
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      aiLogger.ollamaError('model-info', error as Error);
      throw new Error(`Failed to get model info: ${(error as any).message}`);
    }
  }

  // 편의 메서드: 단일 메시지로 채팅
  async singleChat(
    systemPrompt: string,
    userMessage: string,
    stream: boolean = false
  ): Promise<AsyncIterable<OllamaStreamResponse> | string> {
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    const result = await this.chat(messages, stream);

    if (stream) {
      return result as AsyncIterable<OllamaStreamResponse>;
    } else {
      return (result as OllamaResponse).message.content;
    }
  }

  // 편의 메서드: 대화 히스토리 포함 채팅
  async continueChat(
    systemPrompt: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    newMessage: string,
    stream: boolean = false
  ): Promise<AsyncIterable<OllamaStreamResponse> | string> {
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: newMessage
      }
    ];

    const result = await this.chat(messages, stream);

    if (stream) {
      return result as AsyncIterable<OllamaStreamResponse>;
    } else {
      return (result as OllamaResponse).message.content;
    }
  }
}

export default new OllamaService();