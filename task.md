# Implementation Task List
# Choice Question Generator API

**Project**: Multiple-Choice Question Generator
**Tech Stack**: NestJS, TypeScript, OpenAI API
**Status**: Ready for Implementation

---

## Phase 1: Project Setup

### Task 1.1: Initialize NestJS Project
- [ ] Run `npm i -g @nestjs/cli` (if not installed)
- [ ] Run `nest new quizzly`
- [ ] Choose npm as package manager
- [ ] Navigate to project directory
- [ ] Verify app starts with `npm run start:dev`

### Task 1.2: Configure TypeScript
- [ ] Update `tsconfig.json` with strict mode
- [ ] Enable strict null checks
- [ ] Enable strict property initialization
- [ ] Set `esModuleInterop` to true

### Task 1.3: Install Dependencies
```bash
npm install openai uuid
npm install --save-dev @types/uuid
```

### Task 1.4: Environment Setup
- [ ] Create `.env` file in root
- [ ] Add `OPENAI_API_KEY=your-key-here`
- [ ] Add `OPENAI_MODEL=gpt-4o-mini`
- [ ] Add `PORT=3000`
- [ ] Create `.env.example` with placeholder values
- [ ] Update `.gitignore` to include `.env`

### Task 1.5: Configure NestJS Config Module
- [ ] Install `@nestjs/config`: `npm install @nestjs/config`
- [ ] Import ConfigModule in AppModule
- [ ] Set `isGlobal: true`
- [ ] Set `envFilePath: '.env'`

---

## Phase 2: Create Core Structure

### Task 2.1: Create Enums
**File**: `src/common/enums/difficulty.enum.ts`
```typescript
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}
```

**File**: `src/common/enums/format.enum.ts`
```typescript
export enum Format {
  JSON = 'json',
  MARKDOWN = 'markdown',
}
```

- [ ] Create `src/common/enums/` directory
- [ ] Create `difficulty.enum.ts`
- [ ] Create `format.enum.ts`

### Task 2.2: Create Interfaces
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

- [ ] Create `src/questions/interfaces/` directory
- [ ] Create `question.interface.ts`

### Task 2.3: Create DTOs

**File**: `src/questions/dto/generate-questions.dto.ts`
- [ ] Create `src/questions/dto/` directory
- [ ] Define GenerateQuestionsDto class
- [ ] Add validation decorators:
  - `@IsString()` for system_prompt, user_prompt
  - `@IsNotEmpty()` for required strings
  - `@IsInt()`, `@Min()`, `@Max()` for numbers
  - `@IsEnum()` for difficulty and format

**File**: `src/questions/dto/question-response.dto.ts`
- [ ] Define QuestionDto class
- [ ] Define QuestionResponseDto class

---

## Phase 3: OpenAI Integration

### Task 3.1: Create OpenAI Module
- [ ] Run: `nest g module openai`
- [ ] Run: `nest g service openai`

### Task 3.2: Implement OpenAIService
**File**: `src/openai/openai.service.ts`

- [ ] Import OpenAI from 'openai' package
- [ ] Import ConfigService
- [ ] Inject ConfigService in constructor
- [ ] Initialize OpenAI client with API key
- [ ] Implement `generateQuestions()` method:
  - Accept `systemPrompt` and `userPrompt` parameters
  - Call `openai.chat.completions.create()`
  - Use model from environment variable
  - Set temperature to 0.7
  - Calculate max_tokens dynamically
  - Return response content as string
- [ ] Implement error handling:
  - Catch OpenAI API errors
  - Throw `BadGatewayException` with meaningful message

### Task 3.3: Export OpenAIService
- [ ] Update `src/openai/openai.module.ts`
- [ ] Add `exports: [OpenAIService]`

---

## Phase 4: Questions Feature Module

### Task 4.1: Create Questions Module
- [ ] Run: `nest g module questions`
- [ ] Run: `nest g service questions`
- [ ] Run: `nest g controller questions`

### Task 4.2: Import OpenAIModule
**File**: `src/questions/questions.module.ts`
- [ ] Import OpenAIModule in imports array

### Task 4.3: Implement QuestionsService
**File**: `src/questions/questions.service.ts`

- [ ] Inject OpenAIService in constructor
- [ ] Implement `generateQuestions(dto: GenerateQuestionsDto)`:
  - Call `constructSystemPrompt(dto)`
  - Call `constructUserPrompt(dto)`
  - Call `openAIService.generateQuestions()`
  - Parse OpenAI response
  - Validate question structure
  - Generate UUID for each question using `uuid` package
  - Format response based on `dto.format`
  - Return QuestionResponseDto

- [ ] Implement `constructSystemPrompt(dto)`:
  - Combine user's system_prompt with difficulty instructions
  - Return formatted system message

- [ ] Implement `constructUserPrompt(dto)`:
  - Build prompt with number_of_questions, number_of_options, difficulty
  - Include generation rules
  - Include user's content
  - Return formatted user message

- [ ] Implement `parseOpenAIResponse(response: string)`:
  - Parse JSON response from OpenAI
  - Validate structure
  - Return Question[]
  - Throw InternalServerErrorException if invalid

- [ ] Implement `formatAsMarkdown(questions: Question[])`:
  - Convert questions array to markdown format
  - Include numbering (Q1, Q2, ...)
  - Include difficulty label
  - Include option labels (A, B, C, ...)
  - Return formatted string

### Task 4.4: Implement QuestionsController
**File**: `src/questions/questions.controller.ts`

- [ ] Inject QuestionsService in constructor
- [ ] Create POST endpoint `/questions/generate`:
  - Use `@Post('generate')` decorator
  - Accept `@Body() dto: GenerateQuestionsDto`
  - Call `questionsService.generateQuestions(dto)`
  - Return result

---

## Phase 5: Global Configuration

### Task 5.1: Add Global Validation Pipe
**File**: `src/main.ts`

- [ ] Import `ValidationPipe` from '@nestjs/common'
- [ ] Add `app.useGlobalPipes(new ValidationPipe())` before `app.listen()`

### Task 5.2: Configure CORS (Optional)
- [ ] Add `app.enableCors()` in main.ts if needed

### Task 5.3: Set Port from Environment
- [ ] Use `process.env.PORT || 3000` for app.listen()

---

## Phase 6: Testing

### Task 6.1: Unit Test - QuestionsService
**File**: `src/questions/questions.service.spec.ts`

- [ ] Mock OpenAIService
- [ ] Test `generateQuestions()` with valid input
- [ ] Test `constructSystemPrompt()`
- [ ] Test `constructUserPrompt()`
- [ ] Test `parseOpenAIResponse()` with valid JSON
- [ ] Test `parseOpenAIResponse()` with invalid JSON (should throw)
- [ ] Test `formatAsMarkdown()`

### Task 6.2: Unit Test - OpenAIService
**File**: `src/openai/openai.service.spec.ts`

- [ ] Mock OpenAI client
- [ ] Test `generateQuestions()` with successful API call
- [ ] Test error handling when API fails

### Task 6.3: E2E Test - Questions Endpoint
**File**: `test/questions.e2e-spec.ts`

- [ ] Test POST /questions/generate with valid JSON format request
- [ ] Test POST /questions/generate with valid Markdown format request
- [ ] Test all three difficulty levels
- [ ] Test validation errors (missing fields, invalid enums)
- [ ] Test with various number_of_questions and number_of_options
- [ ] Mock OpenAI service for consistent testing

---

## Phase 7: Error Handling & Validation

### Task 7.1: Ensure Proper Error Responses
- [ ] Verify 400 errors return validation messages
- [ ] Verify 500 errors return generic error messages
- [ ] Verify 502 errors return OpenAI-specific messages

### Task 7.2: Add Logging (Optional for MVP)
- [ ] Use NestJS Logger in services
- [ ] Log OpenAI API calls
- [ ] Log errors with stack traces

---

## Phase 8: Manual Testing

### Task 8.1: Test with Real OpenAI API
- [ ] Start server: `npm run start:dev`
- [ ] Test easy difficulty, JSON format
- [ ] Test medium difficulty, JSON format
- [ ] Test hard difficulty, JSON format
- [ ] Test markdown format output
- [ ] Test with different number of questions (1, 5, 10, 50)
- [ ] Test with different number of options (2, 3, 4, 5, 6)
- [ ] Test various content types (Bible, science, history, etc.)

### Task 8.2: Test Error Scenarios
- [ ] Test with invalid difficulty value
- [ ] Test with number_of_questions > 50
- [ ] Test with number_of_options < 2
- [ ] Test with empty system_prompt
- [ ] Test with missing required fields

### Task 8.3: Verify Response Quality
- [ ] Questions are relevant to input content
- [ ] Difficulty levels produce noticeably different questions
- [ ] Exactly one correct answer per question
- [ ] All options are plausible (especially for medium/hard)
- [ ] No duplicate questions in single response

---

## Phase 9: Documentation & Cleanup

### Task 9.1: Update README.md
- [ ] Add project description
- [ ] Add setup instructions
- [ ] Add usage examples
- [ ] Add API endpoint documentation
- [ ] Add environment variable documentation

### Task 9.2: Code Cleanup
- [ ] Remove unused imports
- [ ] Format code with Prettier
- [ ] Run linter and fix issues
- [ ] Add comments for complex logic
- [ ] Ensure TypeScript strict mode compliance

### Task 9.3: Create .env.example
- [ ] Add all required environment variables with placeholders
- [ ] Add comments explaining each variable

---

## Phase 10: Deployment Preparation (Optional)

### Task 10.1: Production Build
- [ ] Run `npm run build`
- [ ] Verify build succeeds
- [ ] Test production build: `npm run start:prod`

### Task 10.2: Docker Setup (Optional)
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Test Docker build and run

---

## Success Criteria Checklist

- [ ] Server starts successfully on port 3000
- [ ] POST /questions/generate accepts valid payloads
- [ ] OpenAI API integration works
- [ ] Questions are generated with correct format
- [ ] JSON format returns valid, parseable JSON
- [ ] Markdown format returns properly formatted markdown
- [ ] All three difficulty levels work as expected
- [ ] Input validation rejects invalid payloads
- [ ] Error messages are clear and helpful
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing confirms quality questions

---

## Notes

- **Testing**: Run `npm run test` for unit tests, `npm run test:e2e` for integration tests
- **Development**: Use `npm run start:dev` for hot-reload during development
- **Debugging**: Use VSCode debugger or console.log in services
- **Cost Monitoring**: Each API call to OpenAI has a cost; monitor usage during testing

---

## Next Steps (Post-MVP)

- [ ] Add database integration (PostgreSQL/MongoDB)
- [ ] Implement user authentication
- [ ] Add caching layer (Redis)
- [ ] Implement rate limiting
- [ ] Add answer explanations
- [ ] Create admin dashboard
- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement question history and retrieval
- [ ] Add analytics and monitoring

---

**End of Task List**


Took a bit more than two weeks to complete the week 1 module of Ed Donner's LLM-ENGINEERING COURSE.
After concluding the week 1's exercise, I knew I had to do more with the new knowledge I just gained. Ed would always say "test this model, break something, see how the model thinks, learn from it"  but I could not think of any at the time, I stalled a bit before moving forward to week 2, little did I know an opportunity would present itself in an infant application (mercyDiet: A daily devotional for the church) I and a couple of developers are building as worker's in the tech department in church.
Version1 is out, the version 2 is to come out soon with new UIs and some other features and one of which is tracking if users actually go through the devotional. We were to track this by using a simple quiz with a done button as check.
Currently we pull posts (which include texts and links) from wordpress to service the app even though the app still makes use of postgres for authentication (for users previously on wordpress app wanting to log into the mobile app and vice-versa) and upcoming features. To get the questions and answers, someone would have to create new fields and manually input the questions and answer on wordpress so that I pull and serve the application. I thought to myself, that would be tedious, then I remembered my new found superpower and lightly suggested I could auto generate the questions and answers, persist to the postgres database and serve the app of course with no guarantees! lol. I finally completed the app with the help of super claude, ran and tested it, deployed on render and the joy I felt can't be explained. This is just me in my first week utilising my knowledege on frontier models and how to interact with different models using openAI's package.
Super excited about what is to come. Thank you Ed Donner and to my mentor and friend that recommended the course.
You will find the public repo here : https://github.com/Aktive134/quizzly
And interact with the api here: https://quizzly-x9ja.onrender.com/