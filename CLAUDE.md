# Choice Question Generator API - Project Documentation

## Project Overview

**Product**: AI-powered multiple-choice question generator API
**Type**: Stateless backend service (no database for MVP)
**Tech Stack**: NestJS, TypeScript, Multi-Provider AI (OpenAI, Google Gemini)
**Developer**: Solo
**Goal**: Generate structured, high-quality multiple-choice questions with adjustable difficulty from any given text input using frontier AI models

**Primary Use Cases**:
- Educational tools
- Quiz generators
- Study assistants
- Content comprehension testing
- Adaptive learning platforms

---

## Core Objective

Transform raw text input into structured multiple-choice questions with:
- Clear, unambiguous questions
- Plausible distractors (incorrect options)
- Exactly one correct answer
- Adjustable difficulty levels (easy, medium, hard)
- Consistent formatting (JSON or Markdown)

---

## AI Behavior Specification

You are an expert educator, examiner, and content analyst.

**Your responsibilities**:
1. Extract meaningful concepts from the provided text
2. Generate assessment-quality multiple-choice questions
3. Adjust question complexity based on difficulty level
4. Ensure accuracy and clarity in all questions and answers

---

## Question Generation Rules (STRICT)

### Question Rules
- Questions MUST be derived strictly from the provided content
- No external knowledge unless explicitly implied by the text
- Avoid vague or subjective phrasing
- Avoid repetition across questions
- Ensure diversity (cover different parts of the text)
- Adjust complexity based on `difficulty` parameter

### Difficulty Level Guidelines

**Easy**:
- Direct recall questions
- Obvious answers found explicitly in the text
- Simple vocabulary
- Clear, straightforward distractors

**Medium**:
- Requires understanding and interpretation
- May need to connect multiple pieces of information
- Moderate vocabulary
- More plausible distractors

**Hard**:
- Requires analysis, synthesis, or inference
- May involve implicit information
- Advanced vocabulary and concepts
- Highly plausible distractors that test deep understanding

### Answer Rules
- Each question MUST have exactly ONE correct answer
- The correct answer must be clearly supported by the text
- The answer must be one of the provided options

### Distractor Rules (Incorrect Options)
- Must be plausible and contextually related
- Difficulty level affects how similar distractors are to correct answer
- Must NOT be obviously wrong or absurd (especially for medium/hard)
- Avoid duplication or semantic overlap between options
- Should test comprehension, not trick the user

### Option Rules
- Total options = `number_of_options` parameter
- Structure: 1 correct answer + (N-1) incorrect answers
- Randomize the position of the correct answer
- All options should be similar in length and complexity

---

## API Input Parameters

```typescript
{
  system_prompt: string;
  user_prompt: string;
  number_of_questions: number;
  number_of_options: number;
  difficulty: 'easy' | 'medium' | 'hard';
  format: 'json' | 'markdown';
}
```

### Parameter Constraints
- `system_prompt`: Custom AI behavior instruction (required, non-empty string)
- `user_prompt`: The text content to generate questions from (required, non-empty string)
- `number_of_questions`: Must be > 0 and <= 50 (required, integer)
- `number_of_options`: Must be >= 2 and <= 6 (required, integer)
- `difficulty`: Must be "easy", "medium", or "hard" (required, enum)
- `format`: Must be either "json" or "markdown" (required, enum)

---

## Output Specification

### JSON Format (STRICT Schema)

```typescript
{
  status: 'true';
  message: 'choice questions generated successfully';
  data: Array<{
    id: string; // UUID v4
    question: string;
    options: string[];
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}
```

**Requirements**:
- `id`: Unique UUID v4 for each question
- `question`: The question text
- `options`: Array of exactly `number_of_options` strings
- `answer`: Must be one of the strings from `options` array
- `difficulty`: Echo back the difficulty level used

### Markdown Format

```markdown
Q1. [Easy] Question text here?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Answer: C

Q2. [Medium] Question text here?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Answer: A
```

**Requirements**:
- Use sequential question numbering (Q1, Q2, Q3...)
- Include difficulty level in brackets [Easy], [Medium], [Hard]
- Use alphabetical option labels (A, B, C, D...)
- Clearly mark the correct answer
- Add blank line between questions

---

## OpenAI Prompt Construction

### System Message Template
```
{system_prompt}

You are generating {difficulty} level multiple-choice questions. Adjust the complexity accordingly:
- Easy: Direct recall, obvious answers
- Medium: Requires understanding and interpretation
- Hard: Analysis, synthesis, and inference required
```

### User Message Template
```
Generate {number_of_questions} multiple-choice questions at {difficulty} difficulty level from the content below.

Rules:
- Each question must have exactly {number_of_options} options
- Only one correct answer per question
- Questions must be based strictly on the content provided
- Adjust question complexity to match {difficulty} level
- Do not include explanations or additional commentary
- Output must be in strict {format} format

Content:
{user_prompt}
```

---

## NestJS Architecture

### Project Structure
```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── questions/
│   ├── questions.module.ts          # Questions feature module
│   ├── questions.controller.ts      # HTTP controller
│   ├── questions.service.ts         # Business logic
│   ├── dto/
│   │   ├── generate-questions.dto.ts    # Request DTO
│   │   └── question-response.dto.ts     # Response DTO
│   └── interfaces/
│       └── question.interface.ts    # TypeScript interfaces
├── openai/
│   ├── openai.module.ts             # OpenAI module
│   └── openai.service.ts            # OpenAI API integration
└── common/
    ├── enums/
    │   ├── difficulty.enum.ts       # Difficulty enum
    │   └── format.enum.ts           # Format enum
    └── pipes/
        └── validation.pipe.ts       # Custom validation
```

### Architecture Flow

```
HTTP Request (POST /questions/generate)
    ↓
QuestionsController (@Body validation with DTOs)
    ↓
QuestionsService (Business Logic)
    ↓
OpenAIService (API Integration)
    ↓
OpenAI API (chat.completions.create)
    ↓
Response Parsing & Validation
    ↓
Format Output (JSON or Markdown)
    ↓
HTTP Response
```

---

## NestJS Coding Standards

### General Principles
- Use dependency injection for all services
- Keep controllers thin (delegate to services)
- Use DTOs for all request/response validation
- Use enums for fixed value sets (difficulty, format)
- Implement proper error handling with NestJS exceptions
- Use TypeScript strict mode

### Module Organization
- Feature-based modules (e.g., QuestionsModule, OpenAIModule)
- Shared modules in `common/`
- Clear separation of concerns

### DTOs and Validation
- Use `class-validator` decorators for validation
- Use `class-transformer` for serialization
- Define both request and response DTOs
- Use `ValidationPipe` globally

Example DTO:
```typescript
import { IsString, IsInt, Min, Max, IsEnum, IsNotEmpty } from 'class-validator';

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

### Service Pattern
- Services are `@Injectable()`
- Business logic lives in services
- Services can inject other services
- Use async/await for OpenAI calls

### Error Handling
- Use NestJS built-in exceptions:
  - `BadRequestException` for validation errors
  - `InternalServerErrorException` for processing errors
  - `BadGatewayException` for OpenAI API errors
- Custom exception filters if needed

### AI Provider Integration
- Create dedicated `OpenAIService` (handles all providers)
- Use `openai` npm package (works with OpenAI-compatible endpoints)
- Configure API key and base URL via environment variables
- Use `ConfigModule` for configuration management
- Support multiple providers (OpenAI, Gemini, etc.)
- Handle API errors gracefully

---

## Success Criteria

A successful response must have:
1. Correct number of questions (`number_of_questions`)
2. Correct number of options per question (`number_of_options`)
3. Exactly one valid answer per question
4. Questions match the specified `difficulty` level
5. Properly formatted output (valid JSON or Markdown)
6. No duplicate questions
7. Questions relevant to the input content

---

## Pre-Execution Checklist

Before sending response to client:
- [ ] All input parameters validated via DTOs
- [ ] Difficulty level is valid (enum validation)
- [ ] OpenAI API responded successfully
- [ ] Output format matches requested format (JSON/Markdown)
- [ ] Question count matches `number_of_questions`
- [ ] Option count matches `number_of_options` for each question
- [ ] Each question has exactly one correct answer
- [ ] Questions match the difficulty level
- [ ] No ambiguity in answers

---

## Error Handling

### Validation Errors (400 Bad Request)
```typescript
throw new BadRequestException({
  statusCode: 400,
  message: 'Validation failed',
  errors: validationErrors
});
```

### OpenAI API Errors (502 Bad Gateway)
```typescript
throw new BadGatewayException({
  statusCode: 502,
  message: 'OpenAI API request failed',
  error: apiError
});
```

### Processing Errors (500 Internal Server Error)
```typescript
throw new InternalServerErrorException({
  statusCode: 500,
  message: 'Failed to process questions',
  error: error.message
});
```

---

## Configuration

### Multi-Provider Support

The application supports multiple AI providers through OpenAI-compatible endpoints. The OpenAI SDK works with any provider that implements the OpenAI Chat Completions API format.

### Environment Variables (.env)

**For OpenAI:**
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
AI_MODEL=gpt-4o-mini
PORT=3000
NODE_ENV=development
```

**For Google Gemini:**
```
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIza...
AI_MODEL=gemini-2.0-flash-exp
PORT=3000
NODE_ENV=development
```

### NestJS ConfigModule
```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
```

### Provider Configuration

Providers are configured in `src/common/config/ai-providers.config.ts`:
- **OpenAI**: Default endpoint, models: gpt-4o, gpt-4o-mini, gpt-3.5-turbo
- **Google Gemini**: Custom base URL, models: gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash

### Recommended Settings
- **OpenAI Model**: `gpt-4o-mini` (cost-effective)
- **Gemini Model**: `gemini-2.0-flash-exp` (free tier, very fast)
- Temperature: 0.7 (balanced creativity)
- Max tokens: Calculated based on `number_of_questions` × `number_of_options`

---

## Testing Strategy

### Unit Tests (Jest)
- Service methods (QuestionsService, OpenAIService)
- DTO validation
- Prompt construction logic
- Response parsing

### Integration Tests (e2e)
- End-to-end API calls with test data
- All three difficulty levels
- Various parameter combinations
- Error scenarios (invalid inputs, API failures)

### Test Structure
```
test/
├── unit/
│   ├── questions.service.spec.ts
│   └── openai.service.spec.ts
└── e2e/
    └── questions.e2e-spec.ts
```

---

## Development Workflow

1. Initialize NestJS project (`nest new quizzly`)
2. Install dependencies (openai, uuid, class-validator, etc.)
3. Set up environment variables (.env file)
4. Create module structure (Questions, OpenAI modules)
5. Define DTOs with validation
6. Implement OpenAIService
7. Implement QuestionsService
8. Create controller with endpoint
9. Add global validation pipe
10. Test with sample requests at all difficulty levels
11. Write unit and e2e tests
12. Refine prompts for better question quality

---

## Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "openai": "^4.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "ts-node": "^10.0.0"
  }
}
```

---

## Notes for Claude

When implementing this project:
- Follow NestJS best practices (modules, services, controllers)
- Use dependency injection throughout
- Reference API specifications in `docs/api-spec.md`
- Reference architecture details in `docs/architecture.md`
- Check `task.md` for implementation tasks
- Adhere strictly to the generation rules above
- Ensure difficulty levels produce noticeably different questions
- Use TypeScript strict mode
- Write comprehensive tests
- Prioritize code clarity and maintainability
