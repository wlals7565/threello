import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CheckList } from '../../checklist/entities/checklist.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('check_item')
export class CheckItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '체크리스트아이디(참조)',
    example: '1',
  })
  @Column()
  checklist_id: number;

  @Column()
  lists_order: number;

  @ApiProperty({
    description: '체크리스트콘텐츠',
    example: 'test content',
  })
  @Column()
  content: string;

  @Column({ default: false })
  is_done: boolean;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @ManyToOne(() => CheckList, (checklist) => checklist.check_item, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'checklist_id', referencedColumnName: 'id' }])
  checklist: CheckList;
}
