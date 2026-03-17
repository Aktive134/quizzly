# Product Requirements Document (PRD)
# Choice Question Generator API

**Version**: 1.0 (MVP)
**Last Updated**: March 2026
**Status**: Planning Phase
**Tech Stack**: NestJS, TypeScript, Multi-Provider AI (OpenAI, Google Gemini)

---

## 1. Product Vision

### 1.1 Problem Statement
Educators, content creators, and learning platforms need a quick, reliable way to generate high-quality multiple-choice questions from text content. Manual question creation is time-consuming, requires pedagogical expertise, and doesn't scale.

### 1.2 Solution
An AI-powered REST API built with NestJS that automatically generates multiple-choice questions with adjustable difficulty levels from any text input using multiple AI providers, making assessment creation fast, scalable, and accessible.

### 1.3 Success Metrics
- Generate questions in < 10 seconds for typical requests
- 95% of questions are contextually accurate
- Support 3 difficulty levels (easy, medium, hard)
- 100% valid JSON/Markdown output
- Support multiple AI providers (OpenAI, Google Gemini)
- Zero downtime from application errors

---

## 2. User Stories

### Story 1: Generate Questions from Content
**As a** Bible study teacher
**I want to** submit devotional text and generate comprehension questions
**So that** I can create quizzes for my students without spending hours writing questions

**Acceptance Criteria**:
- API accepts text input up to 10,000 characters
- Returns requested number of questions (1-50)
- Questions are based strictly on provided content
- Response time < 10 seconds

---

### Story 2: Control Question Difficulty
**As a** course instructor
**I want to** specify difficulty level (easy, medium, hard)
**So that** I can create assessments appropriate for beginner, intermediate, or advanced students

**Acceptance Criteria**:
- Easy questions test direct recall from text
- Medium questions require understanding and interpretation
- Hard questions test analysis, synthesis, and inference
- Difficulty level is clearly labeled in output
- Noticeable quality difference between levels

---

### Story 3: Customize Question Parameters
**As a** quiz platform developer
**I want to** control the number of questions and answer options
**So that** I can match my platform's quiz format requirements

**Acceptance Criteria**:
- Can request 1-50 questions per API call
- Can specify 2-6 answer options per question
- All questions follow the same format within one request
- Exactly one correct answer per question guaranteed

---

### Story 4: Choose Output Format
**As a** content management system
**I want to** receive results in JSON or Markdown format
**So that** I can either integrate programmatically or display in human-readable format

**Acceptance Criteria**:
- JSON output is valid, parseable, and follows strict schema
- Markdown output is properly formatted and human-readable
- Format is specified in request payload
- No format conversion errors

---

### Story 5: Customize AI Behavior
**As a** specialized educator (theology, science, history)
**I want to** provide a custom system prompt
**So that** the AI generates domain-specific questions with appropriate terminology and context

**Acceptance Criteria**:
- System prompt influences question style, tone, and domain expertise
- Questions maintain subject matter accuracy
- No limit on system prompt length (within OpenAI API limits)
- Prompt is combined with base instructions effectively

---

## 3. Core Features

### Feature 1: Question Generation Engine
**Priority**: P0 (Must Have)

**Description**: Core AI-powered engine that generates multiple-choice questions from text input using multiple AI providers (OpenAI, Google Gemini, etc.).

**Technical Requirements**:
- Multi-provider support (OpenAI, Google Gemini)
- Provider-agnostic design using OpenAI-compatible endpoints
- Prompt engineering for consistent, high-quality output
- Handles text input up to 10,000 characters
- Generates 1-50 questions per request
- Returns structured data (JSON or Markdown)

**NestJS Implementation**:
- `OpenAIService` for multi-provider API integration
- `QuestionsService` for business logic
- Provider configuration in `ai-providers.config.ts`
- Dependency injection pattern

---

### Feature 2: Difficulty Level Control
**Priority**: P0 (Must Have)

**Description**: Three-tier difficulty system that adjusts question complexity and distractor quality.

**Technical Requirements**:
- `difficulty` parameter: enum of "easy", "medium", "hard"
- Prompt instructions vary by difficulty level
- Output includes difficulty label for each question

**Difficulty Specifications**:

| Level | Question Complexity | Distractor Quality | Example |
|-------|---------------------|--------------------| --------|
| **Easy** | Direct recall, explicit facts | Clearly incorrect, obvious | "What color was mentioned?" |
| **Medium** | Comprehension, connections | Somewhat plausible | "What was the main cause of...?" |
| **Hard** | Analysis, inference, synthesis | Highly plausible, nuanced | "What can be inferred about...?" |

**NestJS Implementation**:
- `Difficulty` enum in `common/enums/`
- Validated via `class-validator` in DTO

---

### Feature 3: Flexible Output Formats
**Priority**: P0 (Must Have)

**Description**: Support for both JSON (API integration) and Markdown (human-readable) output formats.

**Technical Requirements**:
- JSON output follows strict TypeScript interface
- Markdown output is properly formatted with numbering
- Format specified via `format` enum parameter
- Formatting logic in `QuestionsService`

**NestJS Implementation**:
- `Format` enum in `common/enums/`
- Response formatting in service layer
- Type-safe response DTOs

---

### Feature 4: Configurable Question Structure
**Priority**: P0 (Must Have)

**Description**: Fine-grained control over number of questions and answer options per question.

**Technical Requirements**:
- `number_of_questions`: integer, range 1-50
- `number_of_options`: integer, range 2-6
- Exactly one correct answer per question (validated)
- All options must be unique within a question

**NestJS Implementation**:
- Validation via `@Min()`, `@Max()` decorators
- Response validation before returning to client

---

### Feature 5: Custom AI Prompting
**Priority**: P0 (Must Have)

**Description**: Allow users to define AI behavior and domain expertise via custom system prompt.

**Technical Requirements**:
- `system_prompt` parameter (string, required, non-empty)
- Combined with base difficulty instructions
- Influences question style, tone, and domain context
- No length limit (within AI provider's context window)

**NestJS Implementation**:
- Prompt construction in `QuestionsService`
- Template-based prompt generation

---

## 4. Technical Constraints

### 4.1 MVP Limitations
**Out of Scope for MVP**:
- ❌ Database storage (stateless API)
- ❌ User authentication/authorization
- ❌ Application-level rate limiting (rely on AI provider limits)
- ❌ Caching layer (Redis, in-memory)
- ❌ Question history or versioning
- ❌ Answer explanations
- ❌ Question tags/categories
- ❌ Batch processing of multiple texts
- ❌ WebSocket/streaming support

**In Scope for MVP**:
- ✅ Single endpoint: `POST /questions/generate`
- ✅ Stateless request-response model
- ✅ Input validation with DTOs
- ✅ Error handling
- ✅ TypeScript strict mode
- ✅ Unit and e2e tests

### 4.2 Performance Requirements
- **Response Time**: < 10 seconds typical (depends on AI provider API)
- **Uptime**: Best effort (no SLA for MVP)
- **Concurrent Requests**: Limited by AI provider rate limits
- **Memory**: Stateless, minimal footprint

### 4.3 Security Requirements
- API keys stored in `.env` file (never committed)
- Input validation to prevent injection attacks
- No user data persistence
- CORS configuration for production deployment

### 4.4 AI Provider Constraints
- Rate limits apply (tier-based, varies by provider)
- Token limits per request (calculate dynamically)
- Cost per request varies by provider:
  - OpenAI gpt-4o-mini: ~$0.15 per 1M input tokens
  - Google Gemini: Free tier available, then ~$0.075 per 1M input tokens

---

## 5. API Specification

### 5.1 Endpoint
```
POST /questions/generate
Content-Type: application/json
```

### 5.2 Request Payload (TypeScript)
```typescript
{
  system_prompt: string;          // Custom AI instructions
  user_prompt: string;            // Text to generate questions from
  number_of_questions: number;    // 1-50
  number_of_options: number;      // 2-6
  difficulty: 'easy' | 'medium' | 'hard';
  format: 'json' | 'markdown';
}
```

### 5.3 Response (JSON Format)
```typescript
{
  status: 'true';
  message: 'choice questions generated successfully';
  data: Array<{
    id: string;                   // UUID v4
    question: string;
    options: string[];            // Length matches number_of_options
    answer: string;               // One of the options
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}
```

### 5.4 Response (Markdown Format)
```typescript
{
  status: 'true';
  message: 'choice questions generated successfully';
  data: string;  // Formatted markdown string
}
```

### 5.5 Error Response
```typescript
{
  statusCode: number;             // 400, 500, 502
  message: string;
  error?: string;
  errors?: ValidationError[];     // For validation failures
}
```

---

## 6. Non-Functional Requirements

### 6.1 Reliability
- Graceful error handling for OpenAI API failures
- Clear, actionable error messages
- Retry logic for transient errors (optional for MVP)
- Logging for debugging and monitoring

### 6.2 Maintainability
- Clean, readable TypeScript code
- Dependency injection throughout
- Comprehensive inline documentation
- Unit and integration tests
- Clear separation of concerns (controllers, services, DTOs)

### 6.3 Scalability
- Stateless design enables horizontal scaling
- Minimal memory footprint per request
- No blocking operations (async/await)
- Ready for containerization (Docker)

### 6.4 Testability
- Unit tests for all services
- E2E tests for API endpoints
- Mock AI provider APIs for testing
- Jest testing framework

---

## 7. Dependencies

### 7.1 External Services
- **AI Providers**: OpenAI, Google Gemini (using OpenAI-compatible endpoints)
- **Node.js**: Runtime (v18+ recommended)

### 7.2 NPM Packages

**Production**:
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` - Framework
- `@nestjs/config` - Environment configuration
- `openai` - OpenAI SDK (works with all OpenAI-compatible APIs)
- `class-validator`, `class-transformer` - Validation
- `uuid` - UUID generation
- `rxjs`, `reflect-metadata` - NestJS dependencies

**Development**:
- `@nestjs/cli`, `@nestjs/schematics` - CLI tools
- `@nestjs/testing` - Testing utilities
- `typescript` - Language
- `jest`, `ts-jest` - Testing framework
- `@types/*` - Type definitions

---

## 8. Validation Rules

### 8.1 Input Validation (DTO Level)

| Parameter | Type | Constraints | Error Message |
|-----------|------|-------------|---------------|
| `system_prompt` | string | Required, non-empty | "system_prompt must not be empty" |
| `user_prompt` | string | Required, non-empty | "user_prompt must not be empty" |
| `number_of_questions` | number | Integer, min: 1, max: 50 | "number_of_questions must be between 1 and 50" |
| `number_of_options` | number | Integer, min: 2, max: 6 | "number_of_options must be between 2 and 6" |
| `difficulty` | enum | "easy" \| "medium" \| "hard" | "difficulty must be one of: easy, medium, hard" |
| `format` | enum | "json" \| "markdown" | "format must be one of: json, markdown" |

### 8.2 Output Validation (Service Level)
- Response contains exactly `number_of_questions` questions
- Each question has exactly `number_of_options` options
- Each question has exactly one answer
- Answer exists in the options array
- No duplicate questions (best effort)
- All UUIDs are valid v4 format

---

## 9. Future Enhancements (Post-MVP)

### Phase 2: Data Persistence & User Management
- PostgreSQL/MongoDB for question storage
- User authentication (JWT)
- API key management per user
- Request history and analytics

### Phase 3: Advanced Features
- Caching layer (Redis)
- Rate limiting per user/API key
- Answer explanations field
- Question categories/tags
- Difficulty auto-detection
- Question quality scoring

### Phase 4: Platform Features
- Admin dashboard (React/Next.js)
- Batch question generation
- Multiple language support
- Image-based questions
- Export to various formats (PDF, CSV, DOCX)
- Integration webhooks

---

## 10. Open Questions & Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Should we implement rate limiting? | No (MVP) | Rely on AI provider rate limits; add later if needed |
| Which providers to support? | OpenAI & Gemini (MVP) | Cover most common use cases; easy to add more |
| Max token handling strategy? | Calculate dynamically | Based on `number_of_questions` × `number_of_options` |
| How to handle malformed AI responses? | Return 500 error | Fail gracefully; suggest retry |
| Duplicate question detection? | No (MVP) | Rely on prompt engineering; add later |
| Support streaming responses? | No (MVP) | Simplify implementation; add in Phase 2 |
| TypeScript strict mode? | Yes | Better type safety and fewer runtime errors |

---

## 11. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI Provider API downtime | High | Low | Support multiple providers; return clear error |
| Poor question quality | Medium | Medium | Refine prompts; test with real content |
| Excessive API costs | Medium | Low | Monitor usage; support cheaper providers (Gemini) |
| Invalid user input crashes app | Low | High | Strict DTO validation with class-validator |
| AI generates malformed JSON | Medium | Low | Parse with try-catch; validate before returning |

---

## 12. Development Tasks (High-Level)

Implementation order:

1. **Project Setup**
   - Initialize NestJS project
   - Configure TypeScript (strict mode)
   - Set up environment variables

2. **Core Structure**
   - Create module structure (App, Questions, OpenAI)
   - Define enums (Difficulty, Format)
   - Create DTOs with validation

3. **AI Provider Integration**
   - Implement OpenAIService (multi-provider support)
   - Configure provider endpoints and API keys
   - Prompt construction logic
   - API call with error handling

4. **Business Logic**
   - Implement QuestionsService
   - Response parsing and validation
   - Format conversion (JSON/Markdown)

5. **API Layer**
   - Create QuestionsController
   - Add global validation pipe
   - Error handling

6. **Testing**
   - Unit tests for services
   - E2E tests for endpoint
   - Mock AI provider responses

7. **Documentation**
   - API documentation (Swagger optional)
   - README with examples
   - Deployment guide

---

## 13. Example Use Cases

### Use Case 1: Bible Study Quiz (Easy)
```json
{
  "system_prompt": "You are a Bible scholar creating quiz questions for beginners.",
  "user_prompt": "The parable of the Good Samaritan teaches about helping others in need, regardless of their background...",
  "number_of_questions": 5,
  "number_of_options": 4,
  "difficulty": "easy",
  "format": "json"
}
```

**Expected Output**: Direct recall questions with obvious incorrect answers.

---

### Use Case 2: Science Quiz (Hard)
```json
{
  "system_prompt": "You are a university-level biology professor.",
  "user_prompt": "Photosynthesis occurs in chloroplasts where light energy is converted to chemical energy...",
  "number_of_questions": 10,
  "number_of_options": 4,
  "difficulty": "hard",
  "format": "markdown"
}
```

**Expected Output**: Analysis-level questions with highly plausible distractors.

---

### Use Case 3: History Quiz (Medium)
```json
{
  "system_prompt": "You are a high school history teacher.",
  "user_prompt": "The Industrial Revolution began in Britain in the late 18th century...",
  "number_of_questions": 8,
  "number_of_options": 3,
  "difficulty": "medium",
  "format": "json"
}
```

**Expected Output**: Comprehension questions requiring connections between facts.

---

## 14. Approval & Sign-off

**Prepared by**: Solo Developer
**Target Completion**: TBD
**Status**: Ready for Implementation

---

**End of PRD**
