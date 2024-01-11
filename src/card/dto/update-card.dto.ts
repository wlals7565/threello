import { PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';
import { IsOptional, IsString } from 'class-validator';
import { Column } from 'typeorm';
import { Color } from '../../common/types/color.type';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'enum', enum: Color, nullable: true })
  color?: Color;

  @IsString()
  content?: string;

  // @IsOptional()
  // @IsString()
  // @Column({ nullable: true })
  // due_date?: string;
}
