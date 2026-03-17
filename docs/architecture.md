# Architecture Documentation
# Choice Question Generator API

**Tech Stack**: NestJS, TypeScript, Multi-Provider AI (OpenAI, Google Gemini)
**Architecture Pattern**: Modular, Layered Architecture
**Design Philosophy**: Clean separation of concerns, dependency injection, provider-agnostic design

---

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Project Structure](#project-structure)
3. [Module Design](#module-design)
4. [Data Flow](#data-flow)
5. [Component Responsibilities](#component-responsibilities)
6. [Key Design Decisions](#key-design-decisions)

---

## High-Level Architecture

### System Overview

```
┌─────────────┐
│   Client    │
│ (HTTP/REST) │
└──────┬──────┘
       │
       │ POST /questions/generate
       │ (JSON payload)
       ▼
┌─────────────────────────────────────────┐
│         NestJS Application              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   QuestionsController             │ │
│  │   - Route handling                │ │
│  │   - DTO validation                │ │
│  └──────────┬────────────────────────┘ │
│             │                           │
│             ▼                           │
│  ┌───────────────────────────────────┐ │
│  │   QuestionsService                │ │
│  │   - Business logic                │ │
│  │   - Prompt construction           │ │
│  │   - Response formatting           │ │
│  └──────────┬────────────────────────┘ │
│             │                           │
│             ▼                           │
│  ┌───────────────────────────────────┐ │
│  │   OpenAIService                   │ │
│  │   - Multi-provider support        │ │
│  │   - API integration               │ │
│  │   - Error handling                │ │
│  └──────────┬────────────────────────┘ │
│             │                           │
└─────────────┼───────────────────────────┘
              │
              │ chat.completions.create()
              │ (with provider-specific baseURL)
              ▼
      ┌─────────────────────────┐
      │   AI Provider APIs      │
      │  - OpenAI (gpt-4o-mini) │
      │  - Gemini (gemini-2.0)  │
      │  - Others (extensible)  │
      └─────────────────────────┘
```

---

## Project Structure

```
quizzly/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module (imports all feature modules)
│   │
│   ├── questions/                       # Questions feature module
│   │   ├── questions.module.ts          # Feature module definition
│   │   ├── questions.controller.ts      # HTTP endpoints
│   │   ├── questions.service.ts         # Business logic
│   │   ├── dto/
│   │   │   ├── generate-questions.dto.ts    # Request validation
│   │   │   └── question-response.dto.ts     # Response structure
│   │   └── interfaces/
│   │       └── question.interface.ts    # TypeScript interfaces
│   │
│   ├── openai/                          # AI Provider integration module
│   │   ├── openai.module.ts             # AI Provider module
│   │   └── openai.service.ts            # Multi-provider API wrapper
│   │
│   └── common/                          # Shared utilities
│       ├── config/
│       │   └── ai-providers.config.ts   # Provider configurations
│       ├── enums/
│       │   ├── difficulty.enum.ts       # Difficulty levels
│       │   └── format.enum.ts           # Output formats
│       └── pipes/
│           └── validation.pipe.ts       # Custom validation (optional)
│
├── test/
│   ├── unit/
│   │   ├── questions.service.spec.ts
│   │   └── openai.service.spec.ts
│   └── e2e/
│       └── questions.e2e-spec.ts
│
├── .env                                 # Environment variables
├── .env.example                         # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## Module Design

### 1. App Module (Root)
**File**: `src/app.module.ts`

**Purpose**: Root module that bootstraps the application

**Responsibilities**:
- Import all feature modules
- Configure global modules (ConfigModule)
- Set up global providers (ValidationPipe)

**Code Structure**:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuestionsModule } from './questions/questions.module';
import { OpenAIModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    QuestionsModule,
    OpenAIModule,
  ],
})
export class AppModule {}
```

---

### 2. Questions Module
**File**: `src/questions/questions.module.ts`

**Purpose**: Feature module for question generation

**Responsibilities**:
- Provide QuestionsController and QuestionsService
- Import OpenAIModule for dependency injection

**Code Structure**:
```typescript
import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [OpenAIModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
```

---

### 3. AI Provider Module (OpenAI Module)
**File**: `src/openai/openai.module.ts`

**Purpose**: Encapsulate multi-provider AI API integration

**Responsibilities**:
- Provide OpenAIService (handles multiple providers)
- Export service for use in other modules
- Support OpenAI-compatible endpoints

**Code Structure**:
```typescript
import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Module({
  providers: [OpenAIService],
  exports: [OpenAIService],  // Make available to other modules
})
export class OpenAIModule {}
```

---

## Data Flow

### Request-Response Flow

```
1. HTTP Request
   POST /questions/generate
   Body: { system_prompt, user_prompt, number_of_questions, ... }

   ↓

2. QuestionsController
   - Validates request body using GenerateQuestionsDto
   - class-validator decorators automatically validate
   - If invalid → 400 Bad Request

   ↓

3. QuestionsService.generateQuestions()
   - Receives validated DTO
   - Constructs system and user prompts
   - Calls OpenAIService

   ↓

4. OpenAIService.generateQuestions()
   - Detects AI provider from environment (AI_PROVIDER)
   - Configures baseURL for provider (Gemini, etc.)
   - Builds chat completion request
   - Sends to appropriate AI provider API
   - Handles errors (timeout, rate limit, etc.)
   - Returns raw response

   ↓

5. QuestionsService (Response Processing)
   - Parses AI provider response
   - Validates question structure
   - Generates UUIDs for each question
   - Formats output (JSON or Markdown)

   ↓

6. QuestionsController
   - Returns formatted response
   - 200 OK with question data
```

---

## Component Responsibilities

### QuestionsController
**File**: `src/questions/questions.controller.ts`

**Responsibilities**:
- Define HTTP routes (`POST /questions/generate`)
- Validate request body using DTOs
- Delegate business logic to QuestionsService
- Handle HTTP-specific concerns (status codes, headers)

**Key Methods**:
```typescript
@Post('generate')
async generateQuestions(
  @Body() dto: GenerateQuestionsDto
): Promise<QuestionResponse> {
  return this.questionsService.generateQuestions(dto);
}
```

---

### QuestionsService
**File**: `src/questions/questions.service.ts`

**Responsibilities**:
- Business logic for question generation
- Construct prompts for AI providers
- Parse and validate AI provider responses
- Format output (JSON vs Markdown)
- Generate UUIDs
- Error handling for processing failures

**Key Methods**:
```typescript
async generateQuestions(dto: GenerateQuestionsDto): Promise<QuestionResponse>
private constructSystemPrompt(dto: GenerateQuestionsDto): string
private constructUserPrompt(dto: GenerateQuestionsDto): string
private parseOpenAIResponse(response: string): Question[]
private formatAsMarkdown(questions: Question[]): string
```

---

### OpenAIService (Multi-Provider Service)
**File**: `src/openai/openai.service.ts`

**Responsibilities**:
- Initialize OpenAI client with provider-specific configuration
- Detect AI provider from environment (`AI_PROVIDER`)
- Configure base URL for non-OpenAI providers (Gemini, etc.)
- Make API calls to any OpenAI-compatible endpoint
- Handle provider-specific errors
- Manage API configuration (model, temperature, max_tokens)

**Key Methods**:
```typescript
constructor(configService: ConfigService) {
  // Detect provider and configure baseURL
  const provider = configService.get('AI_PROVIDER') || 'openai';
  const providerConfig = getProviderConfig(provider);

  // Initialize with custom baseURL if needed
  this.client = new OpenAI({
    apiKey: configService.get(providerConfig.apiKeyEnvVar),
    baseURL: providerConfig.baseURL
  });
}

async generateQuestions(
  systemPrompt: string,
  userPrompt: string
): Promise<string>
```

**Provider Configuration**:
- Reads from `src/common/config/ai-providers.config.ts`
- Supports OpenAI, Google Gemini, and extensible to others
- Auto-configures baseURL and API key based on `AI_PROVIDER` env var

---

### DTOs (Data Transfer Objects)

#### GenerateQuestionsDto
**File**: `src/questions/dto/generate-questions.dto.ts`

**Purpose**: Validate incoming requests

**Responsibilities**:
- Define request shape
- Enforce validation rules using class-validator

**Code**:
```typescript
import { IsString, IsInt, Min, Max, IsEnum, IsNotEmpty } from 'class-validator';
import { Difficulty } from '../../common/enums/difficulty.enum';
import { Format } from '../../common/enums/format.enum';

export class GenerateQuestionsDto {
  @IsString()
  @IsNotEmpty()
  system_prompt: string;

  @IsString()
  @IsNotEmpty()
  user_prompt: string;

  @IsInt()
  @Min(1)
  @Max(50)
  number_of_questions: number;

  @IsInt()
  @Min(2)
  @Max(6)
  number_of_options: number;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsEnum(Format)
  format: Format;
}
```

---

#### QuestionResponseDto
**File**: `src/questions/dto/question-response.dto.ts`

**Purpose**: Define response structure

**Code**:
```typescript
export class QuestionDto {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
}

export class QuestionResponseDto {
  status: 'true';
  message: 'choice questions generated successfully';
  data: QuestionDto[] | string;  // Array for JSON, string for Markdown
}
```

---

### Enums

#### Difficulty Enum
**File**: `src/common/enums/difficulty.enum.ts`

```typescript
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}
```

#### Format Enum
**File**: `src/common/enums/format.enum.ts`

```typescript
export enum Format {
  JSON = 'json',
  MARKDOWN = 'markdown',
}
```

---

### Interfaces

#### Question Interface
**File**: `src/questions/interfaces/question.interface.ts`

```typescript
export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

---

## Key Design Decisions

### 1. Modular Architecture
**Decision**: Use NestJS modules to separate concerns (Questions, OpenAI)

**Rationale**:
- Clear separation of responsibilities
- Easy to test in isolation
- Scalable for future features (e.g., add HistoryModule, AuthModule)

---

### 2. Dependency Injection
**Decision**: Use NestJS DI container for all services

**Rationale**:
- Loose coupling between components
- Easy to mock dependencies for testing
- Follows NestJS best practices

---

### 3. DTO-Based Validation
**Decision**: Use class-validator decorators for input validation

**Rationale**:
- Declarative validation rules
- Automatic error responses
- Type safety with TypeScript

---

### 4. Stateless Design
**Decision**: No database or session storage for MVP

**Rationale**:
- Simpler implementation
- Lower operational overhead
- Easier horizontal scaling

---

### 5. OpenAI Service Abstraction
**Decision**: Separate OpenAI logic into dedicated service

**Rationale**:
- Easy to swap AI providers in future
- Centralized error handling for API calls
- Reusable across multiple features

---

### 6. Prompt Construction in Service Layer
**Decision**: Build prompts in QuestionsService, not controller

**Rationale**:
- Business logic belongs in service layer
- Controller stays thin and focused on HTTP concerns
- Easier to test prompt generation

---

### 7. Synchronous Response (No Streaming)
**Decision**: Use standard completion, not streaming

**Rationale**:
- Simpler implementation for MVP
- Easier error handling
- Can add streaming in future version

---

## Error Handling Strategy

### Layered Error Handling

```
1. DTO Validation (Controller Layer)
   - Handled by ValidationPipe
   - Returns 400 Bad Request automatically

2. Business Logic Errors (Service Layer)
   - Throw InternalServerErrorException
   - Returns 500 Internal Server Error

3. OpenAI API Errors (OpenAI Service Layer)
   - Catch OpenAI errors
   - Throw BadGatewayException
   - Returns 502 Bad Gateway
```

### Example Error Flow

```typescript
// OpenAIService
try {
  const response = await this.openai.chat.completions.create(...);
} catch (error) {
  throw new BadGatewayException('OpenAI API request failed');
}

// QuestionsService
try {
  const rawResponse = await this.openAIService.generateQuestions(...);
  const questions = this.parseResponse(rawResponse);
} catch (error) {
  if (error instanceof BadGatewayException) throw error;
  throw new InternalServerErrorException('Failed to process questions');
}
```

---

## Configuration Management

### Environment Variables

**File**: `.env`

```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
PORT=3000
NODE_ENV=development
```

### ConfigModule Setup

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
})

// openai.service.ts
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {
  this.openai = new OpenAI({
    apiKey: this.configService.get<string>('OPENAI_API_KEY'),
  });
}
```

---

## Scalability Considerations

### Current Architecture
- **Stateless**: Each request is independent
- **Horizontally Scalable**: Can run multiple instances
- **No Database**: No bottleneck from DB connections

### Future Enhancements
- Add Redis caching for repeated questions
- Implement request queue for high load
- Add database for question history
- Implement WebSocket for streaming responses

---

## Testing Architecture

### Unit Tests
- **Target**: Services (QuestionsService, OpenAIService)
- **Approach**: Mock dependencies using Jest
- **Coverage**: Business logic, prompt construction, parsing

### Integration Tests
- **Target**: Controllers
- **Approach**: Use NestJS testing utilities
- **Coverage**: End-to-end request/response flow

### E2E Tests
- **Target**: Full application
- **Approach**: Supertest for HTTP testing
- **Coverage**: Real API calls (with mocked OpenAI)

---

## Security Considerations

### API Key Protection
- Store in `.env` file (not committed to git)
- Use ConfigService for access
- Never expose in logs or error messages

### Input Validation
- Strict DTO validation prevents injection
- Limit request payload size
- Sanitize inputs before sending to OpenAI

### CORS Configuration
- Configure for production deployment
- Restrict allowed origins
- Set appropriate headers

---

**End of Architecture Documentation**
