import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Categories } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../utilities/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import { Users } from '../users/entities/user.entity';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categories, Users]),
    AuthModule
  ], 
  controllers: [CategoriesController],
  providers: [CategoriesService, AuthService, JwtService, UsersService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
