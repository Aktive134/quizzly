/**
 * AI Provider Configuration
 *
 * This file defines the configuration for different AI providers that use
 * OpenAI-compatible endpoints. The OpenAI SDK can work with any provider
 * that implements the OpenAI Chat Completions API format.
 */

export interface AIProviderConfig {
  name: string;
  baseURL?: string; // Optional: undefined means use OpenAI's default endpoint
  apiKeyEnvVar: string; // Which env variable to read the API key from
  apiKeyPrefix: string; // Expected prefix for validation (e.g., "sk-", "AIza")
  defaultModel: string;
  supportedModels: string[];
}

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    // No baseURL needed - OpenAI SDK uses default endpoint
    apiKeyEnvVar: 'OPENAI_API_KEY',
    apiKeyPrefix: 'sk-',
    defaultModel: 'gpt-4o-mini',
    supportedModels: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ],
  },
  gemini: {
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKeyEnvVar: 'GOOGLE_API_KEY',
    apiKeyPrefix: 'AIza',
    defaultModel: 'gemini-2.5-flash-lite',
    supportedModels: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ],
  },
  // Easy to add more providers in the future:
  // anthropic: {
  //   name: 'Anthropic',
  //   baseURL: 'https://api.anthropic.com/v1/openai/',
  //   apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  //   apiKeyPrefix: 'sk-ant-',
  //   defaultModel: 'claude-3.5-sonnet',
  //   supportedModels: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
  // },
};

export function getProviderConfig(provider: string): AIProviderConfig {
  const config = AI_PROVIDERS[provider.toLowerCase()];

  if (!config) {
    const supportedProviders = Object.keys(AI_PROVIDERS).join(', ');
    throw new Error(
      `Unsupported AI provider: "${provider}". Supported providers: ${supportedProviders}`,
    );
  }

  return config;
}
