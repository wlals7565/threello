import { IsBoolean, IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { User } from '../../user/entities/user.entity';

@Entity('board_members')
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  boardId: number;

  @IsNotEmpty()
  @IsBoolean()
  @Column({ default: true })
  is_accept: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column()
  is_host: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Board, (boards) => boards.boardMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'boardId', referencedColumnName: 'id' }])
  board: Board;

  @ManyToOne(() => User, (user) => user.boardMembers, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;
}
