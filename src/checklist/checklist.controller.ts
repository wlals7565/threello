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
import { CheckListService } from './checklist.service';
import { CreateCheckListDto } from './dto/create-checklist.dto';
import { UpdateCheckListDto } from './dto/update-checklist.dto';
import { CardService } from '../card/card.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BoardMemberGuard } from '../auth/guard/board-member.guard';
import { CheckList } from './entities/checklist.entity';
@ApiBearerAuth()
@ApiTags('6. /:boardId/checklist')
@Controller('/:boardId/checklist')
export class CheckListController {
  constructor(
    private readonly checkListService: CheckListService,
    private readonly cardService: CardService,
  ) {}

  @ApiOperation({
    summary: '체크리스트 생성 API',
    description: '체크리스트를 생성합니다.',
  })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Post()
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiBody({ type: CreateCheckListDto })
  @ApiResponse({
    schema: {
      properties: {
        card_id: { type: 'number', example: 1 },
        check_order: { type: 'string', example: 1 },
        title: { type: 'string', example: 'checkListTitle' },
      },
    },
  })
  async create(@Body() createCheckListDto: CreateCheckListDto) {
    await this.cardService.getCard(createCheckListDto.card_id);
    const listCount = await this.checkListService.count(
      createCheckListDto.card_id,
    );
    return await this.checkListService.create(
      createCheckListDto,
      Number(listCount.total_list_count) + 1,
    );
  }
  // 전체보기는 보드보기에 딸려서 이미 실행될거같음 일단 기재
  @ApiOperation({
    summary: '카드 내 체크리스트 모두 조회 API',
    description: '카드 ID를 통해 특정 카드의 체크리스트를 모두 조회 합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Get('all/:card_id')
  @ApiResponse({ type: CheckList, isArray: true })
  async findAll(@Param('card_id') card_id: number) {
    return await this.checkListService.findAll(card_id);
  }

  @ApiOperation({
    summary: '특정 체크리스트 조회 API',
    description: '체크리스트 ID를 통해 특정 체크리스트를 조회합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Get(':listId')
  @ApiResponse({ type: CheckList, isArray: true })
  async findOne(@Param('listId') id: number) {
    return await this.checkListService.findOne(+id);
  }

  @ApiOperation({
    summary: '체크리스트 수정 API',
    description: '체크리스트를 수정합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @ApiBody({ type: UpdateCheckListDto })
  @ApiResponse({ type: CheckList })
  @Patch(':listId')
  async update(
    @Param('listId') id: number,
    @Body() updateCheckListDto: UpdateCheckListDto,
  ) {
    return await this.checkListService.update(+id, updateCheckListDto);
  }

  @ApiOperation({
    summary: '체크리스트 이동 API',
    description: '체크리스트를 이동합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @ApiResponse({ type: CheckList })
  @Patch(':listId/:to')
  async moveListBlock(@Param('listId') id: number, @Param('to') to: number) {
    return await this.checkListService.moveCheckListBlock(+id, to);
  }

  @ApiOperation({
    summary: '체크리스트 삭제 API',
    description: '체크리스트를 삭제합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Delete(':listId')
  async remove(@Param('listId') id: string) {
    return await this.checkListService.remove(+id);
  }
}
