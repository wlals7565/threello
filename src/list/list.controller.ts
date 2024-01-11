import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ListService } from './list.service';
import { BoardService } from '../board/board.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ResponseInterface } from 'src/response/interface/response.interface';
import { AuthGuard } from '@nestjs/passport';
import { BoardMemberGuard } from '../auth/guard/board-member.guard';

@ApiTags('3. /:boardId/list')
@Controller('/:boardId/list')
export class ListController {
  // 하단에 board_users 서비스 권한이 추가되어야함
  constructor(
    private readonly listService: ListService,
    private readonly boardService: BoardService,
  ) {}

  @ApiOperation({
    summary: '리스트 생성 API',
    description: '리스트를 생성합니다.',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateListDto })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Post()
  @ApiResponse({
    status: 201,
    description: '성공적으로 리스트를 생성했습니다.',
    type: ResponseInterface, // 또는 응답 형식의 클래스 또는 타입
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  async create(
    @Body() createListDto: CreateListDto,
    @Param('boardId') boardId: number,
  ) {
    await this.boardService.getBoardById(boardId);
    const listCount = await this.listService.count(boardId);
    return await this.listService.create(
      boardId,
      createListDto,
      Number(listCount.total_list_count) + 1,
    );
  }
  // 전체보기는 보드보기에 딸려서 이미 실행될거같음 일단 기재
  @ApiOperation({
    summary: '특정 보드의 모든 리스트 조회 API',
    description: '보드 ID를 통해 특정 보드의 모든 리스트를 조회합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @Get('all/:boards_id')
  async findAll(@Param('boards_id') boards_id: number) {
    return await this.listService.findAll(boards_id);
  }

  @ApiOperation({
    summary: '특정 리스트 조회 API',
    description: '리스트 ID를 통해 특정 리스트를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Get(':listId')
  async findOne(@Param('listId') id: number) {
    return await this.listService.findOne(+id);
  }

  @ApiOperation({
    summary: '리스트 수정 API',
    description: '리스트를 수정합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Patch(':listId')
  async update(
    @Param('listId') id: number,
    @Body() updateListDto: UpdateListDto,
  ) {
    return await this.listService.update(+id, updateListDto);
  }

  @ApiOperation({
    summary: '리스트 이동 API',
    description: '리스트를 이동합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Patch(':listId/:to')
  async moveListBlock(@Param('listId') id: number, @Param('to') to: number) {
    return await this.listService.moveListBlock(+id, to);
  }

  @ApiOperation({
    summary: '리스트 삭제 API',
    description: '리스트를 삭제합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Delete(':listId')
  async remove(@Param('listId') id: string) {
    return await this.listService.remove(+id);
  }
}
