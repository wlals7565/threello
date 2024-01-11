import { Test, TestingModule } from '@nestjs/testing';
import { CheckItemService } from './check_item.service';

describe('CheckItemService', () => {
  let service: CheckItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckItemService],
    }).compile();

    service = module.get<CheckItemService>(CheckItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
