import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { List } from '../../list/entities/list.entity';
import { Color } from 'src/common/types/color.type';
import { CardWorker } from './card.worker.entity';
import { DeadlineStatus } from '../types/deadline.status.type';
import { CheckList } from '../../checklist/entities/checklist.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  list_id: number;

  @IsOptional()
  @IsNumber()
  @Column()
  card_order?: number;

  @IsNotEmpty({ message: '카드 제목을 입력해주세요.' })
  @IsString()
  @Column()
  @ApiProperty({ description: '카드 제목', example: 'Card Title' })
  title: string;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  @ApiProperty({ description: '카드 내용', example: 'Card Content' })
  content?: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'enum', enum: Color, nullable: true })
  @ApiProperty({ description: '카드 인덱스 색상', example: 'blue' })
  color?: Color;

  @IsOptional()
  @Column({ nullable: true })
  due_date?: Date;

  @IsOptional()
  @Column({ type: 'enum', enum: DeadlineStatus, default: 0 })
  deadline_status?: DeadlineStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => CardWorker, (cardWorker) => cardWorker.card)
  card_workers: CardWorker[];

  @OneToMany(() => CheckList, (checklist) => checklist.card)
  checklist: CheckList[];

  @ManyToOne(() => List, (list) => list.card, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'list_id', referencedColumnName: 'id' }])
  list: List;

  @OneToMany(() => CardWorker, (cardWorkers) => cardWorkers.card)
  cardWorkers: CardWorker[];

  @OneToMany(() => Comment, (comment) => comment.card)
  comments: Comment[];
}
