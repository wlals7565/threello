import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CheckItem } from '../../check_item/entities/check_item.entity';
import { Card } from '../../card/entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('checklist')
export class CheckList {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '카드아이디(참조)',
    example: '1',
  })
  @Column()
  card_id: number;

  @Column()
  check_order: number;

  @ApiProperty({
    description: '체크리스트타이틀',
    example: 'test title',
  })
  @Column()
  title: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(() => CheckItem, (check_item) => check_item.checklist)
  check_item: CheckItem[];

  @ManyToOne(() => Card, (card) => card.checklist, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'card_id', referencedColumnName: 'id' }])
  card: Card;
}
