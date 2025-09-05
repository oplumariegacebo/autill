import { Module } from '@nestjs/common';
import { PurchaseReports } from './entities/purchaseReport.entity';
import { PurchaseReportService } from './purchaseReports.service';
import { PurchaseReportsController } from './purchaseReports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../utilities/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import { Users } from '../users/entities/user.entity';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseReports, Users]),
    AuthModule,
    ItemsModule
  ], 
  providers: [PurchaseReportService, AuthService, JwtService, UsersService], 
  controllers: [PurchaseReportsController], 
  exports: [PurchaseReportService]
})
export class PurchaseReportsModule {}