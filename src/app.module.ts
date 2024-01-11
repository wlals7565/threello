import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // env 파일 쓸 때 쓰는 라이브러리(express dotenv 같은 역할)
import { TypeOrmModule } from '@nestjs/typeorm';
import { configModuleValidationSchema } from './configs/env-validation.config';
import { typeOrmModuleOptions } from './configs/database.config';
import { UserModule } from './user/user.module';
import { CardModule } from './card/card.module';
import { CommentModule } from './comment/comment.module';
import { ListModule } from './list/list.module';
import { ChecklistModule } from './checklist/checklist.module';
import { CheckItemModule } from './check_item/check_item.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UserModule,
    CardModule,
    CommentModule,
    ListModule,
    ChecklistModule,
    CheckItemModule,
  ], // 서버 전체에서 ConfigModule 쓸거야
  controllers: [],
  providers: [],
})
export class AppModule {}
