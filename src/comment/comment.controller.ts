import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { BoardService } from 'src/board/board.service';
import { Comment } from './entities/comment.entity';
//TODO: 다시봐야함.
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBody, ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('5. /:boardId/:card_id/comments')
@Controller('/:boardId/:card_id/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 댓글 생성
  @ApiOperation({
    summary: '댓글 생성 API',
    description: '댓글을 생성 합니다.',
  })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    type: Comment,
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글 작성 완료' },
      },
    },
  })
  async createComment(
    @Param('boardId') boardId: number,
    @Param('card_id') card_id: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    const { id } = user;
    const comment = await this.commentService.createComment(
      createCommentDto,
      boardId,
      card_id,
      +id,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '댓글 작성 완료.',
      comment,
    };
  }

  // 댓글 조회
  @ApiResponse({
    type: Comment,
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글 작성 완료' },
      },
    },
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiOperation({
    summary: '전체 댓글 조회 API',
    description: '댓글을 모두 조회합니다.',
  })
  @Get()
  async getComments(
    @Param('boardId') boardId: number,
    @Param('card_id') card_id: number,
  ) {
    const comments = await this.commentService.getComments(boardId, card_id);
    return {
      statusCode: HttpStatus.OK,
      message: '전체 댓글 조회 성공.',
      comments,
    };
  }

  // 특정 댓글 가져오기
  @ApiOperation({
    summary: '특정 댓글 조회 API',
    description: '특정 댓글을 조회합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiResponse({
    type: Comment,
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글 작성 완료' },
      },
    },
  })
  @Get(':commentId')
  async getComment(@Param('commentId') commentId: number) {
    const comment = await this.commentService.getComment(+commentId);
    return {
      statusCode: HttpStatus.OK,
      message: '댓글 조회 완료.',
      comment,
    };
  }

  // 댓글 수정
  @ApiOperation({
    summary: '댓글 수정 API',
    description: '댓글을 수정합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @Patch(':commentId')
  @ApiResponse({
    type: Comment,
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글 작성 완료' },
      },
    },
  })
  @ApiBody({ type: UpdateCommentDto })
  @UseGuards(AuthGuard('jwt'))
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    const loginUserId = user.id;
    const updateComment = await this.commentService.updateComment(
      commentId,
      updateCommentDto,
      loginUserId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: '댓글 수정 완료.',
      updateComment,
    };
  }

  // 댓글 삭제
  @ApiOperation({
    summary: '댓글 삭제 API',
    description: '댓글을 삭제합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiResponse({
    type: Comment,
    isArray: true,
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '댓글 작성 완료' },
      },
    },
  })
  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  removeComment(@Param('commentId') commentId: number, @GetUser() user: User) {
    const loginUserId = user.id;
    this.commentService.removeComment(commentId, loginUserId);

    return {
      statusCode: HttpStatus.OK,
      message: '댓글 삭제 완료.',
    };
  }
}
