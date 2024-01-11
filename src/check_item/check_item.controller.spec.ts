import { Test, TestingModule } from '@nestjs/testing';
import { CheckItemController } from './check_item.controller';

describe('CheckItemController', () => {
  let controller: CheckItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckItemController],
    }).compile();

    controller = module.get<CheckItemController>(CheckItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
