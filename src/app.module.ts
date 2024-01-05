import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // env 파일 쓸 때 쓰는 라이브러리(express dotenv 같은 역할)
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // 환경변수 지정
        SERVER_PORT: Joi.number().required(),
      }),
    }),
  ], // 서버 전체에서 ConfigModule 쓸거야
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
