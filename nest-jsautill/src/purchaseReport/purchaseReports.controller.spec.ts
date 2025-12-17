import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseReportsController } from './purchaseReports.controller';

describe('BudgetsController', () => {
  let controller: PurchaseReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseReportsController],
    }).compile();

    controller = module.get<PurchaseReportsController>(PurchaseReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
