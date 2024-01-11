import { ApiProperty, PickType } from '@nestjs/swagger';
import { Card } from '../entities/card.entity';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCardDto extends PickType(Card, [
  'title',
  'content',
  'color',
  'deadline_status',
]) {
  // @IsOptional()
  // @IsString()
  // due_date?: string;

  @IsOptional()
  @ApiProperty({ description: '마감시간', example: '20:00' })
  dueTimeValue: string;

  @IsOptional()
  @ApiProperty({ description: '마감일', example: '2024-01-11' })
  dueDateValue: string;

  @IsNotEmpty()
  @ApiProperty({ description: '리스트 아이디', example: 1 })
  list_id: number;
}
