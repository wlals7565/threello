import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entities/board.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { BoardMember } from './entities/board-member.entity';
import { ResponseInterface } from 'src/response/interface/response.interface';
import { BoardMemberGuard } from 'src/auth/guard/board-member.guard';

@ApiTags('2. boards')
@Controller('boards')
export class BoardController {
  constructor(private boardService: BoardService) {}

  // 새 보드 생성
  // 칸반보드 만들시 바로 칸반보드사용유저 만들어서 호스트로 등록해두기
  @ApiOperation({
    summary: '보드 만들기 API',
    description: '보드를 만듭니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBody({ type: CreateBoardDto })
  @ApiResponse({ type: Board })
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @Request() req,
  ): Promise<Board> {
    return await this.boardService.createBoard(createBoardDto, req.user.id);
  }

  //보드 내에서 초대가 가능하게
  //초대를 어떻게 받아야할까? 백엔드만 있다. 초대를 어떻게 수락하지

  // 유저가 속한 전체 보드 목록 조회
  @ApiOperation({
    summary: '내 모든 보드 조회 API',
    description: '나의 모든 보드를 조회합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllBoards(@Request() req): Promise<Board[]> {
    return await this.boardService.getAllBoards(req.user.id);
  }

  // ID를 기반으로 특정 보드 조회
  @ApiOperation({
    summary: '특정 보드 조회 API',
    description: '보드 ID를 통해 특정 보드를 조회합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiResponse({ type: Board })
  async getBoardById(@Param('id') id: number): Promise<Board> {
    return await this.boardService.getBoardById(id);
  }

  // 보드 수정도 호스트만 가능하게
  @ApiOperation({
    summary: '보드 수정 API',
    description: '보드를 업데이트 합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Patch(':id')
  @ApiBody({ type: CreateBoardDto })
  @ApiResponse({ type: Board })
  async updateBoard(
    @Param('id') id: number,
    @Body() updateBoardDto: CreateBoardDto,
    @GetUser() user: User,
  ): Promise<Board> {
    return await this.boardService.updateBoard(user.id, id, updateBoardDto);
  }

  // 보드 삭제 고쳐야 한다. 이건 누구나 지울 수 있다.
  @ApiOperation({
    summary: '보드 삭제 API',
    description: 'ID에 해당하는 보드를 삭제합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), Board)
  @Delete(':id')
  async deleteBoard(
    @Param('id') id: number,
    @GetUser() user: User,
  ): Promise<void> {
    await this.boardService.deleteBoard(user.id, id);
  }

  @ApiOperation({
    summary: '보드에 멤버 초대 API',
    description: '보드에 해당 멤버를 초대합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/invite/:boardId')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'test123456@email.com' },
      },
    },
  })
  @UsePipes(ValidationPipe)
  @ApiResponse({ type: ResponseInterface })
  async invite(
    @Param('boardId') boardId: number,
    @Body('email') email: string,
    @GetUser() user: User,
  ) {
    return await this.boardService.invite(boardId, user.id, email, user);
  }

  @ApiOperation({
    summary: '초대 수락 API',
    description: '초대 받은 보드에 초대를 수락합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/join/:boardId')
  @UsePipes(ValidationPipe)
  @ApiResponse({ type: ResponseInterface })
  async joinBoard(@Param('boardId') boardId: number, @GetUser() user: User) {
    return await this.boardService.joinBoard(boardId, user);
  }
}
