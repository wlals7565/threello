import _ from 'lodash';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './entities/list.entity';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    private readonly dataSource: DataSource,
  ) {}

  async create(boards_id, createListDto: CreateListDto, lists_order) {
    const { title } = createListDto;
    await this.listRepository.save({ boards_id, lists_order, title });
    return { boards_id, title, lists_order };
  }

  async findAll(boards_id) {
    const lists = await this.listRepository
      .createQueryBuilder('list')
      .where('list.boards_id = :boards_id', { boards_id })
      .leftJoinAndSelect('list.card', 'card')
      .getRawMany();

    return lists;
  }

  async findOne(id: number) {
    return await this.verifyListById(id);
  }

  async update(id: number, updateListDto: UpdateListDto) {
    await this.listRepository.update({ id }, updateListDto);
  }

  // 리스트 옮기기(트랜잭션)
  async moveListBlock(id: number, to: number) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 선택된 리스트블록 가져오기
      const listBlock = await this.verifyListById(id);
      // 리스트블록의 현재 order값과 옮기려는 값을 비교해서 최대값, 최소값 설정
      let max = 0;
      let min = 0;
      if (listBlock.list[0].lists_order > to) {
        max = listBlock.list[0].lists_order;
        min = to;
      } else {
        max = to;
        min = listBlock.list[0].lists_order;
      }
      // 최대값과 최소값 사이에 있는 order를 가진 모든 리스트 불러오기
      const currentLists = await this.listRepository
        .createQueryBuilder('list')
        .where('list.lists_order >= :min AND list.lists_order <= :max', {
          min: min,
          max: max,
        })
        .getMany();
      // 뒤에서 앞으로 옮기면 앞에있던 모든리스트를 +1, 반대는 -1해야함
      // direction으로 변수설정하고 적용
      const direction = to > listBlock.list[0].lists_order ? -1 : 1;

      for (const list of currentLists) {
        list.lists_order += direction;
      }

      listBlock.list[0].lists_order = to;

      // 기존거 순서 다 바꾸고 현재것도 바꾸기(트랜잭션)
      await queryRunner.manager.save(List, currentLists);
      await queryRunner.manager.save(List, listBlock.list[0]);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return listBlock.list[0];
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
    const list = (await this.verifyListById(id)).list[0];
    const boards_id = list.boards_id;
    const count = await this.count(boards_id);

    // 얘가 맨 마지막 애라면 나머지 order는 변경할 필요 없이 지우고 끗
    if (Number(count.total_list_count) === list.lists_order) {
      await this.listRepository.delete({ id });
      return list; // 리턴해서 아래 코드 실행하지 않게 함
    }
    // 아니라 중간에 껴 있는 애라면 뒤에있는애들 다 앞으로 1칸씩 당겨야함
    // 다시만들면 귀찮으니까 지울 애를 맨 뒤로 보낸 후, 삭제하는것으로 정리
    await this.moveListBlock(id, Number(count.total_list_count));
    await this.listRepository.delete({ id });
  }

  // 지원메서드 count(전체 list 개수를 세 줌)
  async count(boards_id: number) {
    const listCount = await this.listRepository
      .createQueryBuilder('list')
      .where({ boards_id: boards_id })
      .select('COUNT(list.lists_order)', 'total_list_count')
      .getRawOne();

    return await listCount;
  }

  // 지원메서드 verifyListById(한개 아이디로 열람해줌)
  private async verifyListById(id: number) {
    const list = await this.listRepository.find({
      where: { id },
      relations: { card: true },
    });
    if (_.isNil(list)) {
      throw new NotFoundException('존재하지 않는 공연입니다.');
    }

    return await { list };
  }
}
