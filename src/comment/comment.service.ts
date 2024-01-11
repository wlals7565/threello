import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { BoardService } from 'src/board/board.service';
import { CardService } from 'src/card/card.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly boardService: BoardService,
    private readonly cardService: CardService,
  ) {}

  // 댓글 생성
  async createComment(
    createCommentDto: CreateCommentDto,
    boardId: number,
    card_id: number,
    id: number,
  ) {
    const { content } = createCommentDto;
    if (!content) {
      throw new BadRequestException('댓글을 입력해 주세요.');
    }
    const existBoard = await this.boardService.getBoardById(boardId);
    if (!existBoard) {
      throw new NotFoundException('보드가 존재하지 않습니다.');
    }
    const existCard = await this.cardService.getCard(card_id);
    if (!existCard) {
      throw new NotFoundException('카드가 존재하지 않습니다.');
    }
    const newComment = await this.commentRepository.save({
      content,
      user: { id },
      card: { id: card_id },
      board: { id: boardId },
    });
    return newComment;
  }

  // 댓글 조회
  async getComments(boardId: number, card_id: number) {
    const existBoard = await this.boardService.getBoardById(boardId);
    if (!existBoard) {
      throw new NotFoundException('보드가 존재하지 않습니다.');
    }
    const existCard = await this.cardService.getCard(card_id);
    if (!existCard) {
      throw new NotFoundException('카드가 존재하지 않습니다.');
    }
    const getAllComments = await this.commentRepository.find({
      order: { created_at: 'DESC' },
    });
    return getAllComments;
  }

  // 특정 댓글 조회
  async getComment(id: number) {
    const getComment = await this.commentRepository.findOneBy({ id });
    return getComment;
  }

  // 댓글 수정
  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    loginUserId: number,
  ) {
    const existComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!existComment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }
    const userId = await existComment.user_id;
    if (userId !== loginUserId) {
      throw new ForbiddenException('권한이 존재하지 않습니다.');
    }
    await this.commentRepository.update({ id: commentId }, updateCommentDto);
    return existComment;
  }

  // 댓글 삭제
  async removeComment(commentId: number, loginUserId: number) {
    const existComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!existComment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }
    const userId = await existComment.user_id;
    if (userId !== loginUserId) {
      throw new ForbiddenException('권한이 존재하지 않습니다.');
    }
    await this.commentRepository.delete({ id: commentId });
  }
}
