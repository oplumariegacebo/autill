import { Module } from '@nestjs/common';
import { Budgets } from './entities/budget.entity';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../utilities/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import { Users } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budgets, Users]),
    AuthModule
  ], 
  providers: [BudgetsService, AuthService, JwtService, UsersService], 
  controllers: [BudgetsController], 
  exports: [BudgetsService]
})
export class BudgetsModule {}