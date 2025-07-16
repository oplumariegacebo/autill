import { Injectable } from '@nestjs/common';
import { UpdateBillDto } from './dto/update-bill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bills } from './entities/bill.entity';
import { BudgetsService } from 'src/budgets/budgets.service';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bills) private billsRepository: Repository<Bills>,
    private budgetService: BudgetsService
  ) { }

  getPage(initialElement) {
    let PAGINATION = [
        { page: 1, initialElement: 0, finalElement: 10, },
        { page: 2, initialElement: 10, finalElement: 20 },
        { page: 3, initialElement: 20, finalElement: 30 },
        { page: 4, initialElement: 30, finalElement: 40 },
        { page: 5, initialElement: 40, finalElement: 50 },
        { page: 6, initialElement: 50, finalElement: 60 },
        { page: 7, initialElement: 60, finalElement: 70 },
        { page: 8, initialElement: 70, finalElement: 80 },
        { page: 9, initialElement: 80, finalElement: 90 },
        { page: 10, initialElement: 90, finalElement: 100 },
        { page: 11, initialElement: 100, finalElement: 110 },
        { page: 12, initialElement: 110, finalElement: 120 },
        { page: 13, initialElement: 120, finalElement: 130 },
        { page: 14, initialElement: 130, finalElement: 140 },
        { page: 15, initialElement: 140, finalElement: 150 }
    ];

    return PAGINATION[PAGINATION.map(e => e.initialElement).indexOf(initialElement)];
}

  async findAll(options: any): Promise<any> {
    const take = options.take || 10
    const skip = options.skip || 0

    const filterObject = {};
    if (options.filters != null) {
      Object.entries(options.filters)
        .filter(([, value]) => value !== null)
        .forEach(([key, value]) => (filterObject[key] = value));
    }

    filterObject['IdBusiness'] = options.userId;

    const [result, total] = await this.billsRepository.findAndCount({
      where: filterObject,
      order: { Name: "ASC" },
      take,
      skip
    })

    let nfd = 1;
    if (result.length === 0 && options.filters != null) {
      nfd = 0;
    }

    return {
      data: result,
      count: total,
      noFilterData: nfd,
      page: this.getPage(options.skip)
    }
  }

  async create(body: any) {
    let budgetToClone;
    let budget = await this.budgetService.findBudget(body.id);

    budgetToClone = budget;

    budget.CloseIt = true;
    await this.budgetService.updateBudget(body.id, budget);

    budgetToClone.IdBudget = budget.Id;
    budgetToClone.Name = 'Factura-' + (budget.Name.substring(budget.Name.length - 4));

    return this.billsRepository.save(budgetToClone);
  }

  async remove(billId: number): Promise<any> {
    let bill = await this.billsRepository.findOne({ where: { Id: billId } });
    let budget = await this.budgetService.findBudget(bill.IdBudget);

    budget.CloseIt = false;
    await this.budgetService.updateBudget(budget.Id, budget);

    return await this.billsRepository.delete({ Id: billId });
  }

  async cashed(billId: number){
    let bill = await this.billsRepository.findOne({ where: { Id: billId } });
    let uBill = bill;

    uBill.Cashed = true; 

    let updated = Object.assign(bill, uBill);

    return await this.billsRepository.save(updated);
  }
}
