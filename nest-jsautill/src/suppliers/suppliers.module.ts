import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { AuthModule } from '../utilities/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suppliers } from './entities/supplier.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import { Users } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Suppliers, Users]),
    AuthModule
  ], 
  controllers: [SuppliersController],
  providers: [SuppliersService, AuthService, JwtService, UsersService],
})
export class SuppliersModule {}
