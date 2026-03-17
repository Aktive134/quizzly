import { Injectable, BadGatewayException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { getProviderConfig } from '../common/config/ai-providers.config';

@Injectable()
export class OpenAIService {
  private client: OpenAI;
  private model: string;
  private providerName: string;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private configService: ConfigService) {
    // Get the AI provider (default to 'openai')
    const provider = this.configService.get<string>('AI_PROVIDER') || 'openai';
    const providerConfig = getProviderConfig(provider);

    this.providerName = providerConfig.name;

    // Get the API key for the selected provider
    const apiKey = this.configService.get<string>(providerConfig.apiKeyEnvVar);
    if (!apiKey) {
      throw new Error(
        `${providerConfig.apiKeyEnvVar} is not defined in environment variables`,
      );
    }

    // Validate API key format
    if (!apiKey.startsWith(providerConfig.apiKeyPrefix)) {
      this.logger.warn(
        `API key for ${providerConfig.name} should start with "${providerConfig.apiKeyPrefix}"`,
      );
    }

    // Initialize OpenAI client with custom baseURL if needed
    const clientConfig: any = { apiKey };
    if (providerConfig.baseURL) {
      clientConfig.baseURL = providerConfig.baseURL;
      this.logger.log(
        `Using ${providerConfig.name} with base URL: ${providerConfig.baseURL}`,
      );
    } else {
      this.logger.log(`Using ${providerConfig.name} (default endpoint)`);
    }

    this.client = new OpenAI(clientConfig);

    // Get the model (or use provider's default)
    this.model =
      this.configService.get<string>('AI_MODEL') || providerConfig.defaultModel;

    this.logger.log(`AI Provider: ${providerConfig.name}, Model: ${this.model}`);
  }

  async generateQuestions(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No content received from ${this.providerName}`);
      }

      return content;
    } catch (error: any) {
      this.logger.error(`${this.providerName} API Error:`, error.message);
      throw new BadGatewayException(
        `${this.providerName} API request failed: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
