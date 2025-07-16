import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetDto } from './dto/budget.dto';
import { Budgets } from './entities/budget.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('Budgets')
@UseGuards(AuthGuard)
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post('getList')
  findAll(@Body() options: any): Promise<Budgets[]> {
    return this.budgetsService.findAll(options);
  }

  @Get(':budgetId')
  findBudget(@Param('budgetId') budgetId: number): Promise<Budgets> {
    return this.budgetsService.findBudget(budgetId);
  }

  @Post('/nextName')
  nextName(@Body() options: any): Promise<string> {
    return this.budgetsService.nextBudgetName(options);
  }

  @Post() 
  createBudget(@Body() newBudget: BudgetDto): Promise<Budgets> { 
    return this.budgetsService.createBudget(newBudget); 
  }

  @Delete(':budgetId') 
  deleteBudget(@Param('budgetId') budgetId: number): Promise<Budgets> { 
    return this.budgetsService.deleteBudget(budgetId);  
  }

  @Put(':budgetId') 
  editBudget(@Param('budgetId') budgetId: number, @Body() newBudget: BudgetDto): Promise<Budgets> { 
    return this.budgetsService.updateBudget(budgetId, newBudget); 
  }

  @Post('/mailInfo')
  sendEmail(@Body() options: any){
    return this.budgetsService.sendEmail(options);
  }
}
