# Choice Question Generator API

An AI-powered REST API built with NestJS and TypeScript that generates high-quality multiple-choice questions from any text content using **multiple AI providers** (OpenAI, Google Gemini, and more).

## Features

- **🤖 Multi-Provider Support**: Works with OpenAI, Google Gemini, or any OpenAI-compatible API
- **AI-Powered Question Generation**: Leverages frontier models for intelligent question creation
- **Adjustable Difficulty Levels**: Easy, Medium, and Hard question complexity
- **Flexible Output Formats**: JSON (for APIs) or Markdown (for humans)
- **Customizable Parameters**: Control number of questions and answer options
- **Domain-Specific Prompting**: Customize AI behavior with system prompts
- **Type-Safe**: Built with TypeScript in strict mode
- **Input Validation**: Robust validation using class-validator
- **Stateless Design**: No database required for MVP

---

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **AI Providers**: OpenAI, Google Gemini (extensible to any OpenAI-compatible API)
- **Runtime**: Node.js 18+
- **Validation**: class-validator, class-transformer
- **Testing**: Jest

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- AI Provider API key:
  - **OpenAI**: [Get API key here](https://platform.openai.com/api-keys)
  - **Google Gemini**: [Get API key here](https://aistudio.google.com/api-keys)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quizzly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   **For OpenAI:**
   ```bash
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-your-api-key-here
   AI_MODEL=gpt-4o-mini
   PORT=3000
   NODE_ENV=development
   ```

   **For Google Gemini:**
   ```bash
   AI_PROVIDER=gemini
   GOOGLE_API_KEY=AIza-your-google-api-key-here
   AI_MODEL=gemini-2.0-flash-exp
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`

---

## API Usage

### Endpoint

```
POST /questions/generate
Content-Type: application/json
```

### Request Body

```typescript
{
  "system_prompt": string,          // AI behavior instructions
  "user_prompt": string,            // Text to generate questions from
  "number_of_questions": number,    // 1-50
  "number_of_options": number,      // 2-6
  "difficulty": "easy" | "medium" | "hard",
  "format": "json" | "markdown"
}
```

### Example Request (JSON Format)

```bash
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a Bible study expert creating quiz questions.",
    "user_prompt": "The parable of the Good Samaritan teaches about showing compassion to others in need, regardless of their background.",
    "number_of_questions": 3,
    "number_of_options": 4,
    "difficulty": "medium",
    "format": "json"
  }'
```

### Response (JSON Format)

```json
{
  "status": "true",
  "message": "choice questions generated successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "question": "What is the main lesson of the parable of the Good Samaritan?",
      "options": [
        "Showing compassion to others in need",
        "Avoiding strangers on the road",
        "Traveling in groups for safety",
        "Being wealthy is important"
      ],
      "answer": "Showing compassion to others in need",
      "difficulty": "medium"
    }
  ]
}
```

### Example Request (Markdown Format)

```bash
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a science teacher.",
    "user_prompt": "Photosynthesis is the process by which plants convert light energy into chemical energy.",
    "number_of_questions": 2,
    "number_of_options": 3,
    "difficulty": "easy",
    "format": "markdown"
  }'
```

### Response (Markdown Format)

```json
{
  "status": "true",
  "message": "choice questions generated successfully",
  "data": "Q1. [Easy] What is photosynthesis?\nA. A process plants use to convert light energy\nB. A process animals use to digest food\nC. A process to create soil\nAnswer: A\n\nQ2. [Easy] What type of energy do plants convert in photosynthesis?\nA. Sound energy\nB. Light energy\nC. Kinetic energy\nAnswer: B\n"
}
```

---

## Parameters Explained

### system_prompt
Defines the AI's role and expertise. Examples:
- `"You are a Bible study teacher creating quiz questions."`
- `"You are a university biology professor."`
- `"You are a high school history teacher."`

### user_prompt
The text content from which to generate questions. Can be:
- Articles
- Devotionals
- Textbook passages
- Study materials
- Any educational content

### number_of_questions
How many questions to generate (1-50)

### number_of_options
How many answer choices per question (2-6)

### difficulty
- **easy**: Direct recall, obvious answers
- **medium**: Requires understanding and interpretation
- **hard**: Analysis, synthesis, and inference

### format
- **json**: Structured data for programmatic use
- **markdown**: Human-readable formatted text

---

## Multi-Provider Support

This application supports multiple AI providers through **OpenAI-compatible endpoints**. The OpenAI SDK is just a lightweight wrapper around HTTP calls - it works with any provider that implements the OpenAI Chat Completions API format.

### Why Multi-Provider?

- ✅ **Cost Optimization**: Switch to cheaper models when appropriate
- ✅ **Redundancy**: Fallback to other providers if one is down
- ✅ **Model Diversity**: Access different models' strengths
- ✅ **No Vendor Lock-in**: Easy to switch providers

### Supported Providers

| Provider | Base URL | API Key Prefix | Models |
|----------|----------|----------------|--------|
| **OpenAI** | (default) | `sk-` | gpt-4o, gpt-4o-mini, gpt-3.5-turbo |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai/` | `AIza` | gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash |

### How It Works

Even though you see "OpenAI" in the code, the SDK can call **any** OpenAI-compatible endpoint by specifying a custom `baseURL`:

```typescript
// OpenAI (default)
const client = new OpenAI({ apiKey: "sk-..." });

// Google Gemini (using same SDK!)
const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: "AIza..."
});
```

The application automatically configures the correct endpoint based on your `AI_PROVIDER` environment variable.

### Switching Providers

Simply update your `.env` file:

**Use OpenAI:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-key
AI_MODEL=gpt-4o-mini
```

**Use Google Gemini:**
```bash
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIza-your-key
AI_MODEL=gemini-2.0-flash-exp
```

Then restart the server - no code changes needed!

### Adding New Providers

To add support for other OpenAI-compatible providers (Anthropic, Groq, etc.), simply add them to `src/common/config/ai-providers.config.ts`:

```typescript
export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  // ... existing providers
  anthropic: {
    name: 'Anthropic',
    baseURL: 'https://api.anthropic.com/v1/openai/',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    apiKeyPrefix: 'sk-ant-',
    defaultModel: 'claude-3.5-sonnet',
    supportedModels: ['claude-3.5-sonnet', 'claude-3-opus'],
  },
};
```

---

## Difficulty Levels Explained

### Easy
- Direct recall from the text
- Answers are explicitly stated
- Distractors are clearly incorrect
- Simple vocabulary

**Example**: "What color is mentioned in the text?"

### Medium
- Requires comprehension and interpretation
- May need to connect multiple pieces of information
- Distractors are somewhat plausible
- Moderate vocabulary

**Example**: "What was the primary cause of the event described?"

### Hard
- Requires analysis, synthesis, or inference
- May involve implicit information
- Distractors are highly plausible
- Advanced vocabulary

**Example**: "What can be inferred about the author's perspective?"

---

## Error Handling

### 400 Bad Request
Invalid input parameters. Response includes validation errors.

```json
{
  "statusCode": 400,
  "message": [
    "number_of_questions must not be greater than 50"
  ],
  "error": "Bad Request"
}
```

### 500 Internal Server Error
Server-side processing error.

```json
{
  "statusCode": 500,
  "message": "Failed to process questions",
  "error": "Internal Server Error"
}
```

### 502 Bad Gateway
AI provider API request failed (timeout, rate limit, etc.)

```json
{
  "statusCode": 502,
  "message": "OpenAI API request failed",
  "error": "Bad Gateway"
}
```

Note: The error message will show the actual provider name (e.g., "Google Gemini API request failed")

---

## Project Structure

```
src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
├── questions/                       # Questions feature
│   ├── questions.controller.ts
│   ├── questions.service.ts
│   └── dto/
│       └── generate-questions.dto.ts
├── openai/                          # OpenAI integration
│   └── openai.service.ts
└── common/                          # Shared code
    └── enums/
        ├── difficulty.enum.ts
        └── format.enum.ts
```

---

## Development

### Run in Development Mode
```bash
npm run start:dev
```

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Build for Production
```bash
npm run build
npm run start:prod
```

### Linting
```bash
npm run lint
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `openai` | AI provider to use (`openai`, `gemini`) |
| `OPENAI_API_KEY` | Conditional | - | Your OpenAI API key (if using OpenAI) |
| `GOOGLE_API_KEY` | Conditional | - | Your Google API key (if using Gemini) |
| `AI_MODEL` | No | Provider default | Model to use (e.g., `gpt-4o-mini`, `gemini-2.0-flash-exp`) |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |

---

## Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Comprehensive project documentation and AI behavior rules
- **[docs/prd.md](./docs/prd.md)**: Product Requirements Document
- **[docs/api-spec.md](./docs/api-spec.md)**: Detailed API specification
- **[docs/architecture.md](./docs/architecture.md)**: System architecture and design decisions
- **[task.md](./task.md)**: Implementation task checklist

---

## Use Cases

### Educational Platforms
Generate quizzes automatically from lesson content

### Study Tools
Create practice questions from textbook passages

### Content Creators
Generate engagement questions for articles or videos

### E-Learning Systems
Dynamically create assessments based on learning materials

---

## Limitations (MVP)

- No database (stateless API)
- No user authentication
- No caching
- No rate limiting (relies on OpenAI limits)
- Response time depends on OpenAI API latency (typically 5-10 seconds)

---

## Future Enhancements

- [ ] Database integration for question history
- [ ] User authentication and API keys
- [ ] Caching layer (Redis)
- [ ] Rate limiting per user
- [ ] Answer explanations
- [ ] Question tagging and categorization
- [ ] Batch processing
- [ ] Multiple language support
- [ ] Admin dashboard

---

## Cost Considerations

All supported providers use usage-based pricing:

**OpenAI**:
- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Typical request (10 questions): ~$0.001 - $0.005
- Monitor usage: [OpenAI dashboard](https://platform.openai.com/usage)

**Google Gemini**:
- **gemini-2.0-flash-exp**: Free tier available, then ~$0.075 per 1M input tokens
- Significantly cheaper than OpenAI for most use cases
- Monitor usage: [Google AI Studio](https://aistudio.google.com/)

---

## Troubleshooting

### "AI Provider API request failed"
- Verify your API key is correct in `.env`
- Check your account has available credits
- Ensure you're not hitting rate limits
- Verify `AI_PROVIDER` matches the API key you're using (e.g., `openai` requires `OPENAI_API_KEY`)
- Check if the `AI_MODEL` is supported by your chosen provider

### "Validation failed" errors
- Check that all required fields are present
- Verify field values are within allowed ranges
- Ensure enums match exactly (case-sensitive)

### Questions are low quality
- Refine your `system_prompt` with more specific instructions
- Ensure `user_prompt` has sufficient content
- Try adjusting `difficulty` level
- Provide more context in the text

---

## Contributing

This is a solo project for MVP. Contributions welcome post-MVP.

---

## License

[Specify License Here]

---

## Contact

For questions or support, please open an issue in the repository.

---

## Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- AI Providers: [OpenAI](https://openai.com/), [Google Gemini](https://ai.google.dev/)
- Validation by [class-validator](https://github.com/typestack/class-validator)
- Uses OpenAI SDK for provider-agnostic API calls
