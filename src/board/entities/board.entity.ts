import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { List } from '../../list/entities/list.entity';
import { BoardMember } from './board-member.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Color } from 'src/common/types/color.type';
import { ApiProperty } from '@nestjs/swagger';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ message: '보드명을 입력해 주세요.' })
  @IsString()
  @Column()
  @ApiProperty({ description: '보드 제목', example: 'boardTitle' })
  title: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'enum', enum: Color, nullable: true })
  color?: string;

  @OneToMany(() => List, (list) => list.board)
  list: List[];

  @OneToMany(() => BoardMember, (boardMembers) => boardMembers.board) // 보드 멤버와의 일대다 관계 설정
  boardMembers: BoardMember[];

  @OneToMany(() => Comment, (comments) => comments.board)
  comments: Comment[];
}
