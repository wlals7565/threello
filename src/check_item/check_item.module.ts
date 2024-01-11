import { Module } from '@nestjs/common';
import { CheckItemService } from './check_item.service';
import { CheckItemController } from './check_item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckItem } from './entities/check_item.entity';
import { ChecklistModule } from '../checklist/checklist.module';
import { BoardModule } from '../board/board.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CheckItem]),
    ChecklistModule,
    BoardModule,
  ],
  providers: [CheckItemService],
  controllers: [CheckItemController],
})
export class CheckItemModule {}
