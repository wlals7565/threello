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
import { Board } from '../../board/entities/board.entity';
import { Card } from '../../card/entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '보드아이디(참조)', example: '1' })
  @Column()
  boards_id: number;

  @ApiProperty({ description: '리스트간 순서', example: '1' })
  @Column()
  lists_order: number;

  @ApiProperty({ description: '리스트 타이틀', example: 'Todo' })
  @Column()
  title: string;

  @ApiProperty({
    description: '생성일자',
    example: '2024-01-10 12:46:06.173966',
  })
  @CreateDateColumn()
  created_at: string;

  @ApiProperty({
    description: '수정일자',
    example: '2024-01-10 12:46:06.173966',
  })
  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(() => Card, (card) => card.list)
  card: Card[];

  @ManyToOne(() => Board, (board) => board.list, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'boards_id', referencedColumnName: 'id' }])
  board: Board;
}
