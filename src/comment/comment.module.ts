import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

import { BoardModule } from 'src/board/board.module';
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';
import { CardModule } from 'src/card/card.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Board, Card]),
    BoardModule,
    CardModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
