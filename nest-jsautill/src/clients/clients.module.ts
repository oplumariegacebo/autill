import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AuthModule } from '../utilities/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clients } from './entities/client.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import { Users } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clients, Users]),
    AuthModule
  ], 
  controllers: [ClientsController],
  providers: [ClientsService, AuthService, JwtService, UsersService],
})
export class ClientsModule {}
