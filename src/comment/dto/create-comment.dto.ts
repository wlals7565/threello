import { ApiProperty, PickType } from '@nestjs/swagger';
import { Comment } from '../entities/comment.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto extends PickType(Comment, ['content']) {
  @IsNotEmpty({ message: '내용을 입력해 주세요.' })
  @IsString()
  @ApiProperty({ description: '댓글 내용', example: 'commentContent' })
  content: string;
}
