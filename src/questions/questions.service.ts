import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIService } from '../openai/openai.service';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { Question } from './interfaces/question.interface';
import { Format } from '../common/enums/format.enum';

@Injectable()
export class QuestionsService {
  constructor(private readonly openAIService: OpenAIService) {}

  async generateQuestions(
    dto: GenerateQuestionsDto,
  ): Promise<QuestionResponseDto> {
    // Construct prompts
    const systemPrompt = this.constructSystemPrompt(dto);
    const userPrompt = this.constructUserPrompt(dto);

    // Call OpenAI
    const rawResponse = await this.openAIService.generateQuestions(
      systemPrompt,
      userPrompt,
    );

    // Parse and validate response
    const questions = this.parseOpenAIResponse(rawResponse, dto);

    // Format output based on requested format
    if (dto.format === Format.MARKDOWN) {
      const markdownData = this.formatAsMarkdown(questions);
      return {
        status: 'true',
        message: 'choice questions generated successfully',
        data: markdownData,
      };
    }

    // JSON format (default)
    return {
      status: 'true',
      message: 'choice questions generated successfully',
      data: questions,
    };
  }

  private constructSystemPrompt(dto: GenerateQuestionsDto): string {
    const difficultyInstructions = {
      easy: 'Easy: Direct recall, obvious answers',
      medium: 'Medium: Requires understanding and interpretation',
      hard: 'Hard: Analysis, synthesis, and inference required',
    };

    return `${dto.system_prompt}

You are generating ${dto.difficulty} level multiple-choice questions. Adjust the complexity accordingly:
- ${difficultyInstructions[dto.difficulty]}`;
  }

  private constructUserPrompt(dto: GenerateQuestionsDto): string {
    return `Generate ${dto.number_of_questions} multiple-choice questions at ${dto.difficulty} difficulty level from the content below.

Rules:
- Each question must have exactly ${dto.number_of_options} options
- Only one correct answer per question
- Questions must be based strictly on the content provided
- Adjust question complexity to match ${dto.difficulty} level
- Do not include explanations or additional commentary
- Output must be in strict JSON format as an array of objects with the following structure:
  [
    {
      "question": "question text",
      "options": ["option1", "option2", ...],
      "answer": "correct option text"
    }
  ]

Content:
${dto.user_prompt}`;
  }

  private parseOpenAIResponse(
    response: string,
    dto: GenerateQuestionsDto,
  ): Question[] {
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;

      const parsed = JSON.parse(jsonString);

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate and transform each question
      const questions: Question[] = parsed.map((item: any) => {
        if (!item.question || !item.options || !item.answer) {
          throw new Error('Invalid question structure');
        }

        if (!Array.isArray(item.options)) {
          throw new Error('Options must be an array');
        }

        if (item.options.length !== dto.number_of_options) {
          throw new Error(
            `Expected ${dto.number_of_options} options, got ${item.options.length}`,
          );
        }

        if (!item.options.includes(item.answer)) {
          throw new Error('Answer must be one of the options');
        }

        return {
          id: uuidv4(),
          question: item.question,
          options: item.options,
          answer: item.answer,
          difficulty: dto.difficulty,
        };
      });

      return questions;
    } catch (error: any) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Raw response:', response);
      throw new InternalServerErrorException(
        `Failed to process questions: ${error.message}`,
      );
    }
  }

  private formatAsMarkdown(questions: Question[]): string {
    const optionLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return questions
      .map((q, index) => {
        const questionNumber = index + 1;
        const difficulty =
          q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);

        let markdown = `Q${questionNumber}. [${difficulty}] ${q.question}\n`;

        q.options.forEach((option, optIndex) => {
          markdown += `${optionLabels[optIndex]}. ${option}\n`;
        });

        // Find the answer label
        const answerIndex = q.options.indexOf(q.answer);
        const answerLabel = optionLabels[answerIndex];

        markdown += `Answer: ${answerLabel}\n`;

        return markdown;
      })
      .join('\n');
  }
}
