import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bills } from './entities/bill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/utilities/auth.module';
import { BudgetsModule } from 'src/budgets/budgets.module';
import { Users } from 'src/users/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

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
