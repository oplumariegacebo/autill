import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Items } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../utilities/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import { Users } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Items, Users]),
    AuthModule
  ], 
  controllers: [ItemsController],
  providers: [ItemsService, AuthService, JwtService, UsersService],
})
export class ItemsModule {}
