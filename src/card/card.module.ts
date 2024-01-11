import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardWorker } from './entities/card.worker.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { BoardMember } from 'src/board/entities/board-member.entity';
import { BoardModule } from 'src/board/board.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, CardWorker, Comment, BoardMember]),
    BoardModule,
  ],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
