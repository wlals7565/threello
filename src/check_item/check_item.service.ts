import _ from 'lodash';
import { CreateCheckItemDto } from './dto/create-check-item.dto';
import { UpdateCheckItemDto } from './dto/update-check-item.dto';
import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckItem } from './entities/check_item.entity';

@Injectable()
export class CheckItemService {
  constructor(
    @InjectRepository(CheckItem)
    private readonly checkItemRepository: Repository<CheckItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCheckItemDto: CreateCheckItemDto, lists_order) {
    const { checklist_id, content } = createCheckItemDto;
    await this.checkItemRepository.save({ checklist_id, lists_order, content });
    return { checklist_id, content, lists_order };
  }

  async findAll(checklist_id) {
    const checkItems = await this.checkItemRepository
      .createQueryBuilder('check_item')
      .where('check_item.checklist_id = :checklist_id', { checklist_id })
      .getRawMany();

    return checkItems;
  }

  async findOne(id: number) {
    return await this.verifyListById(id);
  }

  async update(id: number, updateCheckItemDto: UpdateCheckItemDto) {
    await this.checkItemRepository.update({ id }, updateCheckItemDto);
  }

  // 리스트 옮기기(트랜잭션)
  async moveCheckItemBlock(id: number, to: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 선택된 리스트블록 가져오기
      const itemBlock = await this.verifyListById(id);
      const checklist_id = itemBlock.checkItem[0].checklist_id;
      // 리스트블록의 현재 order값과 옮기려는 값을 비교해서 최대값, 최소값 설정
      let max = 0;
      let min = 0;
      if (itemBlock.checkItem[0].lists_order > to) {
        max = itemBlock.checkItem[0].lists_order;
        min = to;
      } else {
        max = to;
        min = itemBlock.checkItem[0].lists_order;
      }
      // 최대값과 최소값 사이에 있는 order를 가진 모든 리스트 불러오기
      const currentCheckItems = await this.checkItemRepository
        .createQueryBuilder('check_item')
        .where(
          'check_item.lists_order >= :min AND check_item.lists_order <= :max',
          {
            min: min,
            max: max,
          },
        )
        .andWhere('check_item.checklist_id = :checklist_id', {
          checklist_id: checklist_id,
        })
        .getMany();
      // 뒤에서 앞으로 옮기면 앞에있던 모든리스트를 +1, 반대는 -1해야함
      // direction으로 변수설정하고 적용
      const direction = to > itemBlock.checkItem[0].lists_order ? -1 : 1;

      for (const checkList of currentCheckItems) {
        checkList.lists_order += direction;
      }

      itemBlock.checkItem[0].lists_order = to;

      // 기존거 순서 다 바꾸고 현재것도 바꾸기(트랜잭션)
      await queryRunner.manager.save(CheckItem, currentCheckItems);
      await queryRunner.manager.save(CheckItem, itemBlock.checkItem[0]);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return itemBlock.checkItem[0];
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.error(err);
      throw err;
    }
  }

  // 리스트간 아이템 옮기기(트랜잭션)
  async moveItemBetweenList(
    itemId: number,
    listTo: number,
    itemTo: number,
    listCount: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const item = (await this.verifyListById(itemId)).checkItem[0];
      const { content } = item;
      await this.remove(itemId);
      const CreateCheckItemDto = { checklist_id: listTo, content };
      await this.create(CreateCheckItemDto, listCount);
      const newItem = await this.checkItemRepository.find({
        where: {
          checklist_id: listTo,
          lists_order: listCount,
        },
      });
      await this.moveCheckItemBlock(newItem[0].id, itemTo);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.error(err);
      throw err;
    }
  }

  // 삭제
  async remove(id: number) {
    // 일단 리스트를 열람하고 얘가 전체중 몇번째애인지 확인
    const item = (await this.verifyListById(id)).checkItem[0];
    const checklist_id = item.checklist_id;
    const count = await this.count(checklist_id);

    // 얘가 맨 마지막 애라면 나머지 order는 변경할 필요 없이 지우고 끗
    if (Number(count.total_list_count) === item.lists_order) {
      await this.checkItemRepository.delete({ id });
      return item; // 리턴해서 아래 코드 실행하지 않게 함
    }
    // 아니라 중간에 껴 있는 애라면 뒤에있는애들 다 앞으로 1칸씩 당겨야함
    // 다시만들면 귀찮으니까 지울 애를 맨 뒤로 보낸 후, 삭제하는것으로 정리
    await this.moveCheckItemBlock(id, Number(count.total_list_count));
    await this.checkItemRepository.delete({ id });
  }

  // 지원메서드 count(전체 list 개수를 세 줌)
  async count(checklist_id: number) {
    const listCount = await this.checkItemRepository
      .createQueryBuilder('check_item')
      .where({ checklist_id: checklist_id })
      .select('COUNT(check_item.lists_order)', 'total_list_count')
      .getRawOne();

    return await listCount;
  }

  // 지원메서드 verifyListById(한개 아이디로 열람해줌)
  private async verifyListById(id: number) {
    const checkItem = await this.checkItemRepository.find({
      where: { id },
    });
    if (_.isNil(checkItem)) {
      throw new NotFoundException('존재하지 않는 아이템입니다.');
    }

    return await { checkItem };
  }
}
