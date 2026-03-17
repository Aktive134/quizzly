# API Specification
# Choice Question Generator API

**Version**: 1.0
**Base URL**: `http://localhost:3000` (development)
**Protocol**: HTTP/HTTPS
**Format**: JSON

---

## Table of Contents
1. [Endpoint Overview](#endpoint-overview)
2. [Authentication](#authentication)
3. [Request Specification](#request-specification)
4. [Response Specification](#response-specification)
5. [Error Handling](#error-handling)
6. [Examples](#examples)
7. [Rate Limits](#rate-limits)

---

## Endpoint Overview

### Generate Questions
Generate multiple-choice questions from text content.

```
POST /questions/generate
```

**Purpose**: Accept text content and parameters, return generated multiple-choice questions.

**Content-Type**: `application/json`

---

## Authentication

**MVP**: No authentication required

**Future**: JWT-based authentication or API key

---

## Request Specification

### Endpoint
```
POST /questions/generate
```

### Headers
```
Content-Type: application/json
```

### Request Body (TypeScript Interface)

```typescript
interface GenerateQuestionsRequest {
  system_prompt: string;
  user_prompt: string;
  number_of_questions: number;
  number_of_options: number;
  difficulty: 'easy' | 'medium' | 'hard';
  format: 'json' | 'markdown';
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `system_prompt` | `string` | Yes | Non-empty | Custom AI behavior instructions |
| `user_prompt` | `string` | Yes | Non-empty | Text content to generate questions from |
| `number_of_questions` | `number` | Yes | Min: 1, Max: 50, Integer | Number of questions to generate |
| `number_of_options` | `number` | Yes | Min: 2, Max: 6, Integer | Number of answer choices per question |
| `difficulty` | `enum` | Yes | "easy" \| "medium" \| "hard" | Complexity level of questions |
| `format` | `enum` | Yes | "json" \| "markdown" | Output format |

### Validation Rules

#### system_prompt
- **Type**: String
- **Required**: Yes
- **Min Length**: 1
- **Max Length**: 10,000 characters (recommended)
- **Error**: `"system_prompt should not be empty"`

#### user_prompt
- **Type**: String
- **Required**: Yes
- **Min Length**: 1
- **Max Length**: 10,000 characters (recommended)
- **Error**: `"user_prompt should not be empty"`

#### number_of_questions
- **Type**: Integer
- **Required**: Yes
- **Min**: 1
- **Max**: 50
- **Error**: `"number_of_questions must not be less than 1"` or `"number_of_questions must not be greater than 50"`

#### number_of_options
- **Type**: Integer
- **Required**: Yes
- **Min**: 2
- **Max**: 6
- **Error**: `"number_of_options must not be less than 2"` or `"number_of_options must not be greater than 6"`

#### difficulty
- **Type**: Enum
- **Required**: Yes
- **Allowed Values**: `"easy"`, `"medium"`, `"hard"`
- **Error**: `"difficulty must be one of the following values: easy, medium, hard"`

#### format
- **Type**: Enum
- **Required**: Yes
- **Allowed Values**: `"json"`, `"markdown"`
- **Error**: `"format must be one of the following values: json, markdown"`

---

## Response Specification

### Success Response (JSON Format)

**Status Code**: `200 OK`

**Response Body** (TypeScript Interface):

```typescript
interface QuestionResponseJson {
  status: 'true';
  message: 'choice questions generated successfully';
  data: Question[];
}

interface Question {
  id: string;                              // UUID v4
  question: string;
  options: string[];                       // Length = number_of_options
  answer: string;                          // One of the options
  difficulty: 'easy' | 'medium' | 'hard';
}
```

**Example**:
```json
{
  "status": "true",
  "message": "choice questions generated successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "question": "What is the main theme of the passage?",
      "options": [
        "Love and compassion",
        "Justice and fairness",
        "Wisdom and knowledge",
        "Faith and belief"
      ],
      "answer": "Love and compassion",
      "difficulty": "medium"
    }
  ]
}
```

---

### Success Response (Markdown Format)

**Status Code**: `200 OK`

**Response Body** (TypeScript Interface):

```typescript
interface QuestionResponseMarkdown {
  status: 'true';
  message: 'choice questions generated successfully';
  data: string;  // Formatted markdown
}
```

**Markdown Format**:
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

**Example Response**:
```json
{
  "status": "true",
  "message": "choice questions generated successfully",
  "data": "Q1. [Medium] What is the main theme of the passage?\nA. Love and compassion\nB. Justice and fairness\nC. Wisdom and knowledge\nD. Faith and belief\nAnswer: A\n\nQ2. [Medium] Which character showed mercy?\nA. The priest\nB. The Levite\nC. The Samaritan\nD. The innkeeper\nAnswer: C\n"
}
```

---

## Error Handling

### Error Response Format

All errors return a consistent structure:

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  errors?: ValidationError[];  // For validation failures
}
```

---

### 400 Bad Request - Validation Error

**Cause**: Invalid input parameters

**Response Example**:
```json
{
  "statusCode": 400,
  "message": [
    "number_of_questions must not be greater than 50",
    "difficulty must be one of the following values: easy, medium, hard"
  ],
  "error": "Bad Request"
}
```

**Common Scenarios**:
- Missing required fields
- Invalid data types
- Out-of-range values
- Invalid enum values

---

### 500 Internal Server Error

**Cause**: Unexpected server error during processing

**Response Example**:
```json
{
  "statusCode": 500,
  "message": "Failed to process questions",
  "error": "Internal Server Error"
}
```

**Common Scenarios**:
- Failed to parse AI provider response
- Unexpected exception in service layer
- Output validation failures

---

### 502 Bad Gateway

**Cause**: AI Provider API request failed

**Response Example**:
```json
{
  "statusCode": 502,
  "message": "OpenAI API request failed",
  "error": "Bad Gateway"
}
```

or

```json
{
  "statusCode": 502,
  "message": "Google Gemini API request failed",
  "error": "Bad Gateway"
}
```

**Note**: The error message dynamically shows which AI provider failed.

**Common Scenarios**:
- AI Provider API timeout
- AI Provider rate limit exceeded
- API authentication failure
- Network connectivity issues
- Invalid API key for the selected provider

---

## Examples

### Example 1: Basic Request (Easy Difficulty, JSON Format)

**Request**:
```bash
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a Bible study teacher creating quiz questions.",
    "user_prompt": "The parable of the Good Samaritan teaches about showing compassion to strangers in need.",
    "number_of_questions": 3,
    "number_of_options": 4,
    "difficulty": "easy",
    "format": "json"
  }'
```

**Response** (200 OK):
```json
{
  "status": "true",
  "message": "choice questions generated successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "question": "What does the parable of the Good Samaritan teach about?",
      "options": [
        "Showing compassion to strangers",
        "Traveling safely",
        "Avoiding strangers",
        "Making money"
      ],
      "answer": "Showing compassion to strangers",
      "difficulty": "easy"
    },
    {
      "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      "question": "Who is mentioned in the parable?",
      "options": [
        "The Good Samaritan",
        "The Bad Samaritan",
        "The Rich Man",
        "The Pharisee"
      ],
      "answer": "The Good Samaritan",
      "difficulty": "easy"
    },
    {
      "id": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
      "question": "What should we show to people in need?",
      "options": [
        "Compassion",
        "Indifference",
        "Anger",
        "Fear"
      ],
      "answer": "Compassion",
      "difficulty": "easy"
    }
  ]
}
```

---

### Example 2: Medium Difficulty, Markdown Format

**Request**:
```bash
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a science teacher creating quiz questions for high school students.",
    "user_prompt": "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose.",
    "number_of_questions": 2,
    "number_of_options": 3,
    "difficulty": "medium",
    "format": "markdown"
  }'
```

**Response** (200 OK):
```json
{
  "status": "true",
  "message": "choice questions generated successfully",
  "data": "Q1. [Medium] What is the primary purpose of photosynthesis?\nA. To produce oxygen\nB. To convert light energy into chemical energy\nC. To absorb water\nAnswer: B\n\nQ2. [Medium] In what form is the chemical energy stored during photosynthesis?\nA. ATP\nB. Glucose\nC. Chlorophyll\nAnswer: B\n"
}
```

---

### Example 3: Hard Difficulty with More Options

**Request**:
```bash
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a university professor creating advanced quiz questions.",
    "user_prompt": "The Industrial Revolution marked a shift from agrarian economies to industrial manufacturing, fundamentally changing social structures and labor practices.",
    "number_of_questions": 1,
    "number_of_options": 5,
    "difficulty": "hard",
    "format": "json"
  }'
```

**Response** (200 OK):
```json
{
  "status": "true",
  "message": "choice questions generated successfully",
  "data": [
    {
      "id": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
      "question": "What fundamental shift did the Industrial Revolution represent in terms of economic structure?",
      "options": [
        "A transition from industrial to agrarian economies",
        "A shift from agrarian economies to industrial manufacturing",
        "A change from manufacturing to service-based economies",
        "A move from feudalism to mercantilism",
        "A transformation from capitalism to socialism"
      ],
      "answer": "A shift from agrarian economies to industrial manufacturing",
      "difficulty": "hard"
    }
  ]
}
```

---

### Example 4: Validation Error

**Request** (invalid difficulty):
```bash
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a teacher.",
    "user_prompt": "Sample text.",
    "number_of_questions": 5,
    "number_of_options": 4,
    "difficulty": "super_hard",
    "format": "json"
  }'
```

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": [
    "difficulty must be one of the following values: easy, medium, hard"
  ],
  "error": "Bad Request"
}
```

---

### Example 5: Out of Range Error

**Request** (too many questions):
```bash
curl -X POST http://localhost:3000/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a teacher.",
    "user_prompt": "Sample text.",
    "number_of_questions": 100,
    "number_of_options": 4,
    "difficulty": "easy",
    "format": "json"
  }'
```

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": [
    "number_of_questions must not be greater than 50"
  ],
  "error": "Bad Request"
}
```

---

## Rate Limits

**MVP**: No application-level rate limiting

**Constraints**:
- Limited by AI provider rate limits (tier-based, varies by provider):
  - **OpenAI**: Tier-based (requests per minute, tokens per minute)
  - **Google Gemini**: Free tier: 15 requests/minute, then tier-based
- Recommended: Implement client-side retry logic with exponential backoff

**Future**: Rate limiting per API key or user

**Provider Selection**:
The application uses the provider specified in `AI_PROVIDER` environment variable. Different providers have different rate limits and costs.

---

## Best Practices

### 1. Input Optimization
- Keep `user_prompt` concise but comprehensive (< 10,000 chars)
- Use specific `system_prompt` for better quality questions
- Start with lower `number_of_questions` for testing

### 2. Error Handling
- Implement retry logic for 502 errors (AI provider timeouts)
- Validate inputs client-side before sending requests
- Handle both JSON and Markdown responses appropriately
- Check that API key matches the provider (e.g., `OPENAI_API_KEY` when `AI_PROVIDER=openai`)

### 3. Performance
- Expect 5-10 second response times (varies by provider)
- More questions = longer response time
- Google Gemini is often faster and cheaper than OpenAI
- Consider caching results for repeated content

---

## Versioning

**Current Version**: 1.0

**Future**: Version prefix in URL (e.g., `/v1/questions/generate`)

---

## Changelog

### Version 1.0 (MVP)
- Initial release
- Single endpoint: `POST /questions/generate`
- Support for JSON and Markdown formats
- Three difficulty levels
- Input validation with class-validator
- Multi-provider support (OpenAI, Google Gemini)
- Provider-agnostic architecture using OpenAI-compatible endpoints

---

**End of API Specification**
