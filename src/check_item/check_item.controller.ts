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
import { CheckItemService } from './check_item.service';
import { CreateCheckItemDto } from './dto/create-check-item.dto';
import { UpdateCheckItemDto } from './dto/update-check-item.dto';
import { CheckListService } from '../checklist/checklist.service';
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
import { CheckItem } from './entities/check_item.entity';

@ApiBearerAuth()
@ApiTags('7. /:boardId/check-item')
@Controller('/:boardId/check-item')
export class CheckItemController {
  constructor(
    private readonly checkItemService: CheckItemService,
    private readonly checkListService: CheckListService,
  ) {}

  @ApiOperation({
    summary: '체크아이템 생성 API',
    description: '체크아이템을 생성합니다.',
  })
  @ApiBody({ type: CreateCheckItemDto })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Post()
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiResponse({ type: CheckItem })
  async create(@Body() createCheckItemDto: CreateCheckItemDto) {
    await this.checkListService.findOne(createCheckItemDto.checklist_id);
    const listCount = await this.checkItemService.count(
      createCheckItemDto.checklist_id,
    );
    return await this.checkItemService.create(
      createCheckItemDto,
      Number(listCount.total_list_count) + 1,
    );
  }
  // 전체보기는 보드보기에 딸려서 이미 실행될거같음 일단 기재
  @ApiOperation({
    summary: '체크아이템 모두 조회 API',
    description: '특정 체크리스트 ID를 통해 체크아이템을 생성합니다.',
  })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @Get('all/:checklist_id')
  async findAll(@Param('checklist_id') checklist_id: number) {
    return await this.checkItemService.findAll(checklist_id);
  }

  @ApiResponse({ type: CheckItem })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiOperation({
    summary: '체크아이템 조회 API',
    description: '체크아이템 ID를 통해 특정 체크아이템을 생성합니다.',
  })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Get(':itemId')
  async findOne(@Param('itemId') id: number) {
    return await this.checkItemService.findOne(+id);
  }

  @ApiOperation({
    summary: '체크아이템 수정 API',
    description: '체크아이템을 수정합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @ApiBody({ type: UpdateCheckItemDto })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Patch(':itemId')
  async update(
    @Param('itemId') id: number,
    @Body() updateCheckItemListDto: UpdateCheckItemDto,
  ) {
    return await this.checkItemService.update(+id, updateCheckItemListDto);
  }

  @ApiOperation({
    summary: '체크리스트 내 체크아이템 이동 API',
    description: '체크리스트 내에서 체크아이템을 이동합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Patch(':itemId/:to')
  async moveListBlock(@Param('itemId') id: number, @Param('to') to: number) {
    return await this.checkItemService.moveCheckItemBlock(+id, to);
  }

  // 카드 리스트간 순서 변경
  @ApiOperation({
    summary: '카드 간 체크아이템 이동 API',
    description: '카드 간에 체크아이템을 이동합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Patch(':itemId/:listTo/:itemTo')
  async moveItemBetweenList(
    @Param('itemId') itemId: string,
    @Param('listTo') listTo: string,
    @Param('itemTo') itemTo: string,
  ) {
    const listCount = await this.checkItemService.count(Number(listTo));
    const moveItemBetweenList = await this.checkItemService.moveItemBetweenList(
      +itemId,
      +listTo,
      +itemTo,
      Number(listCount.total_list_count) + 1,
    );
    return moveItemBetweenList;
  }

  @ApiOperation({
    summary: '체크아이템 삭제 API',
    description: '체크아이템을 삭제합니다.',
  })
  @ApiParam({ name: 'boardId', description: 'ID of the board', type: 'number' })
  @UseGuards(AuthGuard('jwt'), BoardMemberGuard)
  @Delete(':itemId')
  async remove(@Param('itemId') id: string) {
    return await this.checkItemService.remove(+id);
  }
}
