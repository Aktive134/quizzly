import {
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Difficulty } from '../../common/enums/difficulty.enum';
import { Format } from '../../common/enums/format.enum';

export class GenerateQuestionsDto {
  @IsString()
  @IsNotEmpty()
  system_prompt!: string;

  @IsString()
  @IsNotEmpty()
  user_prompt!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  number_of_questions!: number;

  @IsInt()
  @Min(2)
  @Max(6)
  number_of_options!: number;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @IsEnum(Format)
  format!: Format;
}
