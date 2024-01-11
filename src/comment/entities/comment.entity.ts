import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty({ description: '보드 아이디', example: 1 })
  board_id: number;

  @Column()
  @ApiProperty({ description: '유저 아이디', example: 1 })
  user_id: number;

  @IsNotEmpty({ message: '내용을 입력해 주세요.' })
  @IsString()
  @Column()
  @ApiProperty({ description: '댓글 내용', example: 'content' })
  content: string;

  @ApiProperty({ description: 'HTTP상태드', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'HTTP상태드', example: 'message' })
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @ManyToOne(() => Board, (board) => board.comments, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'board_id', referencedColumnName: 'id' }])
  board: Board;

  @ManyToOne(() => Card, (card) => card.comments, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'card_id', referencedColumnName: 'id' }])
  card: Card;
}
