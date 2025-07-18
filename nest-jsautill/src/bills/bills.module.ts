import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bills } from './entities/bill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../utilities/auth.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { Users } from '../users/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Bills, Users]),
    AuthModule,
    BudgetsModule
  ], 
  controllers: [BillsController],
  providers: [BillsService, AuthService, JwtService, UsersService],
})
export class BillsModule {}
