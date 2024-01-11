import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { BoardService } from 'src/board/board.service';

@Injectable()
export class BoardMemberGuard implements CanActivate {
  constructor(private boardService: BoardService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 현재 사용자 정보
    const boardId = request.params.boardId; // 요청에서 보드 ID 추출

    const member = await this.boardService.getBoardMember(user.id, boardId);
    return !!member;
  }
}
