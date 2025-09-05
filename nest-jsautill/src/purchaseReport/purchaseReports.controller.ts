import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PurchaseReportService } from './purchaseReports.service';
import { AuthGuard } from '../auth/auth.guard';
import { PurchaseReportDto } from './dto/purchaseReport.dto';

@Controller('PurchaseReports')
@UseGuards(AuthGuard)
export class PurchaseReportsController {
  constructor(private purchaseReportService: PurchaseReportService) {}

  @Post('getList')
  findAll(@Body() options: any): Promise<PurchaseReportDto[]> {
    return this.purchaseReportService.findAll(options);
  }

  @Get(':purchaseReportId')
  findBudget(@Param('purchaseReportId') purchaseReportId: number): Promise<PurchaseReportDto> {
    return this.purchaseReportService.findPurchaseReport(purchaseReportId);
  }

  @Post() 
  createBudget(@Body() newPurchaseReport: PurchaseReportDto): Promise<PurchaseReportDto> { 
    return this.purchaseReportService.createPurchaseReport(newPurchaseReport); 
  }

  @Delete(':purchaseReportId') 
  deleteBudget(@Param('purchaseReportId') budgetId: number): Promise<PurchaseReportDto> { 
    return this.purchaseReportService.deletePurchaseReport(budgetId);  
  }

  @Put(':purchaseReportId') 
  editBudget(@Param('purchaseReportId') purchaseReportId: number, @Body() newPurchaseReport: PurchaseReportDto): Promise<PurchaseReportDto> { 
    return this.purchaseReportService.updatePurchaseReport(purchaseReportId, newPurchaseReport); 
  }

  @Post('orderReceived/:idReport') 
  orderReceived(@Param('idReport') idReport: number, @Body() order: { Id: number, toOrder: number }[]): Promise<{ success: boolean, message: string }> { 
    return this.purchaseReportService.orderReceived(idReport, order); 
  }
  
  /*@Post('/mailInfo')
  sendEmail(@Body() options: any){
    return this.budgetsService.sendEmail(options);
  }*/
}
