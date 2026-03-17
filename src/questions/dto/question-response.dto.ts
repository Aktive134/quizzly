export class QuestionDto {
  id!: string;
  question!: string;
  options!: string[];
  answer!: string;
  difficulty!: string;
}

export class QuestionResponseDto {
  status!: 'true';
  message!: 'choice questions generated successfully';
  data!: QuestionDto[] | string; // Array for JSON, string for Markdown
}
