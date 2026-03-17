import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuestionsModule } from './questions/questions.module';
import { OpenAIModule } from './openai/openai.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    QuestionsModule,
    OpenAIModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
