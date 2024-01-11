import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CardWorker } from './entities/card.worker.entity';
import { CreateWorkerDto } from './dto/create-woker.dto';
import { Card } from 'src/card/entities/card.entity';
import { BoardMember } from 'src/board/entities/board-member.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    @InjectRepository(CardWorker)
    private cardWorkerRepository: Repository<CardWorker>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    private readonly dataSource: DataSource,
  ) {}

  // 카드 생성
  async create(
    list_id: number,
    createCardDto: CreateCardDto,
    dueDateValue: string,
    dueTimeValue: string,
  ) {
    const { title, color, content } = createCardDto;
    const getAllCards = await this.getAllCards(list_id);
    const newCardOrder = getAllCards.length + 1;

    // 날짜는 입력하고 시간 입력 안해줬을 때
    if (!dueTimeValue) dueTimeValue = '00:00';

    const newCard = await this.cardRepository.save({
      title,
      content,
      card_order: newCardOrder,
      color,
      due_date: `${dueDateValue} ${dueTimeValue}`,
      list_id,
    });

    return this.getCard(newCard.id);
  }

  // 모든 카드 조회 (리스트 안에)
  async getAllCards(listId: number) {
    const getAllCards = await this.cardRepository.find({
      where: { list: { id: listId } },
    });
    return getAllCards;
  }

  // 특정 카드 조회, 마감기한에 따른 상태 조회
  async getCard(cardId: number) {
    const getCard = await this.cardRepository.findOneBy({ id: cardId });
    const { id, list_id, title, content, color, deadline_status } = getCard;

    const dueDate = getCard.due_date;
    const dueDateForView = new Date(dueDate.setHours(dueDate.getHours() + 9));

    // 마감기한 설정해주지 않았으면 카드만 조회
    if (!dueDate) return getCard;

    // 마감기한 설정해줬다면?
    // 마감기한 상태 갖고오기
    const deadlineStatus = getCard.deadline_status;

    // 마감기한 상태가 uncomplete면?
    if (deadlineStatus === 0) {
      const nowDate = new Date();

      const timeDifference = dueDate.getTime() - nowDate.getTime();

      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));

      let deadlineStatusWithTime: string = '';

      // 마감기한 넘겼을때
      if (hoursDifference <= 0) {
        deadlineStatusWithTime = 'Overdue';
      } else if (hoursDifference < 24) {
        // 마감기한 하루 전
        deadlineStatusWithTime = 'Due Soon';
      }
      return {
        getCard: {
          id,
          list_id,
          title,
          content,
          color,
          due_date: dueDateForView,
          deadline_status,
        },
        deadlineStatusWithTime,
      };
    }

    // 마감기한 설정해줬고, 상태가 complete면?
    return getCard;
  }

  // 카드 수정
  async update(id: number, updateCardDto: UpdateCardDto) {
    const existingCard = await this.cardRepository.findOneBy({ id });
    if (!existingCard) throw new NotFoundException('해당하는 카드가 없습니다.');
    await this.cardRepository.update({ id }, updateCardDto);
    return this.getCard(id);
  }

  // 카드 삭제
  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingCard = await this.cardRepository.find({ where: { id } });

      if (!existingCard)
        throw new NotFoundException('해당하는 카드가 없습니다.');

      const existingCardOrder = existingCard[0].card_order;

      const countArr = await this.cardRepository.find();

      const count = countArr.length;

      if (count === existingCardOrder) {
        await this.cardRepository.delete({ id });
        return existingCard;
      }
      await this.moveCardBlock(id, count);
      await this.cardRepository.delete({ id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { status: 404, message: error.message };
    } finally {
      // 사용이 끝난 후에는 항상 queryRunner를 해제
      await queryRunner.release();
    }
  }

  // 카드 순서 변경
  async moveCardBlock(cardId: number, to: number) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 선택된 카드 블록 가져오기
      const cardBlock = await this.cardRepository.find({
        where: { id: cardId },
      });

      if (cardBlock[0].id !== cardId)
        throw new NotFoundException(
          '일치하는 카드 아이디 값의 카드가 없습니다.',
        );

      const allCards = await this.cardRepository.find();

      const cardOrderValues = allCards.map((card) => card.card_order);
      if (!cardOrderValues.includes(to))
        throw new NotFoundException('해당하는 위치가 없습니다.');

      let max = 0;
      let min = 0;
      if (cardBlock[0].card_order > to) {
        max = cardBlock[0].card_order;
        min = to;
      } else {
        max = to;
        min = cardBlock[0].card_order;
      }

      const list_id = cardBlock[0].list_id;
      const currentCards = await this.cardRepository
        .createQueryBuilder('card')
        .where('card.card_order >= :min AND card.card_order <= :max', {
          min: min,
          max: max,
        })
        .andWhere('card.list_id = :list_id', {
          list_id: list_id,
        })
        .getMany();

      const direction = to > cardBlock[0].card_order ? -1 : 1;

      for (const card of currentCards) {
        card.card_order += direction;
      }
      cardBlock[0].card_order = to;

      await queryRunner.manager.save(Card, currentCards);
      await queryRunner.manager.save(Card, cardBlock[0]);

      await queryRunner.commitTransaction();
      return cardBlock[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { status: 404, message: error.message };
    } finally {
      // 사용이 끝난 후에는 항상 queryRunner를 해제
      await queryRunner.release();
    }
  }

  // 리스트간 카드 이동
  async moveCardBlockBeteweenList(
    cardId: number,
    listId: number,
    listTo: number,
    cardTo: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 옮기기 전 list_id 값의 속한 카드들 정렬
      const currentListInCards = await this.getAllCards(listId);

      // // 카드 전에 있던 리스트에서 마지막 순서로 옮기기
      await this.moveCardBlock(cardId, currentListInCards.length);

      // 리스트 값 바꾸기
      await this.cardRepository.update(cardId, {
        list: { id: listTo },
      });

      // 옮긴 후 리스트 카드 목록 불러오기
      await this.getAllCards(listTo);

      await this.moveCardBlock(cardId, cardTo);

      await queryRunner.commitTransaction();
      return this.getCard(cardId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { status: 404, message: error.message };
    } finally {
      // 사용이 끝난 후에는 항상 queryRunner를 해제
      await queryRunner.release();
    }
  }

  async count(list_id: number) {
    const cardCount = await this.cardRepository
      .createQueryBuilder('card')
      .where({ list_id: list_id })
      .select('COUNT(card.card_order)', 'total_card_count')
      .getRawOne();

    return await cardCount;
  }

  // 작업자 조회
  async getAllWorkers(boardId: number) {
    return await this.boardMemberRepository.find({
      where: { board: { id: boardId } },
    });
  }

  // 작업자 할당
  async createWorker(
    boardId: number,
    cardId: number,
    createWorkerDto: CreateWorkerDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 초대된 멤버인지
      const getWorkers = await this.getAllWorkers(boardId);
      const invitedWorkerArr = [];
      const createdWorkers = [];
      getWorkers.forEach((worker) => {
        invitedWorkerArr.push(worker.userId);
      });
      const { userIds } = createWorkerDto;

      for (const user of userIds) {
        // 해당 유저가 멤버인지
        if (!invitedWorkerArr.includes(user.id))
          throw new NotFoundException('초대되지 않은 멤버입니다.');

        // 작업자 중복 체크
        const existingWorker = await this.cardWorkerRepository.find({
          where: { user_id: user.id },
        });

        // 중복된 사람 제외 등록
        if (existingWorker.length > 0) {
          throw new Error('중복된 멤버입니다.');
        }
        const newWorker = await queryRunner.manager.save(CardWorker, {
          user_id: user.id,
          card: { id: cardId },
        });
        createdWorkers.push(newWorker);
      }
      await queryRunner.commitTransaction();
      return createdWorkers;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { status: 404, message: error.message };
    } finally {
      // 사용이 끝난 후에는 항상 queryRunner를 해제
      await queryRunner.release();
    }
  }

  // 작업자 삭제
  async removeWorker(cardId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingWorker = await this.cardWorkerRepository.findOne({
        where: { user: { id: userId }, card: { id: cardId } },
      });
      if (!existingWorker)
        throw new NotFoundException('해당되는 사용자가 없습니다.');
      const deleteWorker = await this.cardWorkerRepository.delete({
        user: { id: userId },
      });
      await queryRunner.commitTransaction();
      return deleteWorker;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { status: 404, message: error.message };
    } finally {
      // 사용이 끝난 후에는 항상 queryRunner를 해제
      await queryRunner.release();
    }
  }
}
