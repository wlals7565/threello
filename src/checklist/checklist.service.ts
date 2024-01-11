import _ from 'lodash';
import { CreateCheckListDto } from './dto/create-checklist.dto';
import { UpdateCheckListDto } from './dto/update-checklist.dto';
import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckList } from './entities/checklist.entity';

@Injectable()
export class CheckListService {
  constructor(
    @InjectRepository(CheckList)
    private readonly checklistRepository: Repository<CheckList>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCheckListDto: CreateCheckListDto, check_order) {
    const { card_id, title } = createCheckListDto;
    await this.checklistRepository.save({ card_id, check_order, title });
    return { card_id, title, check_order };
  }

  async findAll(card_id) {
    const checklists = await this.checklistRepository
      .createQueryBuilder('checklist')
      .where('checklist.card_id = :card_id', { card_id })
      .leftJoinAndSelect('checklist.check_item', 'check_item')
      .getRawMany();

    return checklists;
  }

  async findOne(id: number) {
    return await this.verifyListById(id);
  }

  async update(id: number, updateCheckListDto: UpdateCheckListDto) {
    await this.checklistRepository.update({ id }, updateCheckListDto);
  }

  // 리스트 옮기기(트랜잭션)
  async moveCheckListBlock(id: number, to: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 선택된 리스트블록 가져오기
      const listBlock = await this.verifyListById(id);
      const card_id = listBlock.checklists[0].card_id;
      // 리스트블록의 현재 order값과 옮기려는 값을 비교해서 최대값, 최소값 설정
      let max = 0;
      let min = 0;
      if (listBlock.checklists[0].check_order > to) {
        max = listBlock.checklists[0].check_order;
        min = to;
      } else {
        max = to;
        min = listBlock.checklists[0].check_order;
      }
      // 최대값과 최소값 사이에 있는 order를 가진 모든 리스트 불러오기
      const currentCheckLists = await this.checklistRepository
        .createQueryBuilder('checklist')
        .where(
          'checklist.check_order >= :min AND checklist.check_order <= :max',
          {
            min: min,
            max: max,
          },
        )
        .andWhere('checklist.card_id = :card_id', {
          card_id: card_id,
        })
        .getMany();
      // 뒤에서 앞으로 옮기면 앞에있던 모든리스트를 +1, 반대는 -1해야함
      // direction으로 변수설정하고 적용
      const direction = to > listBlock.checklists[0].check_order ? -1 : 1;

      for (const checkList of currentCheckLists) {
        checkList.check_order += direction;
      }

      listBlock.checklists[0].check_order = to;

      // 기존거 순서 다 바꾸고 현재것도 바꾸기(트랜잭션)
      await queryRunner.manager.save(CheckList, currentCheckLists);
      await queryRunner.manager.save(CheckList, listBlock.checklists[0]);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return listBlock.checklists[0];
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
    const list = (await this.verifyListById(id)).checklists[0];
    const card_id = list.card_id;
    const count = await this.count(card_id);

    // 얘가 맨 마지막 애라면 나머지 order는 변경할 필요 없이 지우고 끗
    if (Number(count.total_list_count) === list.check_order) {
      await this.checklistRepository.delete({ id });
      return list; // 리턴해서 아래 코드 실행하지 않게 함
    }
    // 아니라 중간에 껴 있는 애라면 뒤에있는애들 다 앞으로 1칸씩 당겨야함
    // 다시만들면 귀찮으니까 지울 애를 맨 뒤로 보낸 후, 삭제하는것으로 정리
    await this.moveCheckListBlock(id, Number(count.total_list_count));
    await this.checklistRepository.delete({ id });
  }

  // 지원메서드 count(전체 list 개수를 세 줌)
  async count(card_id: number) {
    const listCount = await this.checklistRepository
      .createQueryBuilder('checklist')
      .where({ card_id: card_id })
      .select('COUNT(checklist.check_order)', 'total_list_count')
      .getRawOne();

    return await listCount;
  }

  // 지원메서드 verifyListById(한개 아이디로 열람해줌)
  private async verifyListById(id: number) {
    const checklists = await this.checklistRepository.find({
      where: { id },
      relations: { check_item: true },
    });
    if (_.isNil(checklists)) {
      throw new NotFoundException('존재하지 않는 공연입니다.');
    }

    return await { checklists };
  }
}
