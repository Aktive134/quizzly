import { Controller, Post, Body } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { QuestionResponseDto } from './dto/question-response.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('generate')
  async generateQuestions(
    @Body() dto: GenerateQuestionsDto,
  ): Promise<QuestionResponseDto> {
    return this.questionsService.generateQuestions(dto);
  }
}
