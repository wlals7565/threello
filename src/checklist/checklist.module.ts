import { Module } from '@nestjs/common';
import { CheckListService } from './checklist.service';
import { CheckListController } from './checklist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckList } from './entities/checklist.entity';
import { CardModule } from 'src/card/card.module';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [TypeOrmModule.forFeature([CheckList]), CardModule, BoardModule],
  providers: [CheckListService],
  controllers: [CheckListController],
  exports: [CheckListService],
})
export class ChecklistModule {}
