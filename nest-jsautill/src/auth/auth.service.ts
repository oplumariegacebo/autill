import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcryptjs from "bcryptjs";

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async signIn(
        email: string,
        pass: string,
    ): Promise<{ access_token: string }> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new HttpException('Usuario no encontrado', 500);
        }

        const isPasswordValid = await bcryptjs.compare(pass, user.Password);

        if (!isPasswordValid) {
            throw new UnauthorizedException();
        }
        const payload = { email: user.Email };
        return {
            access_token: await this.jwtService.signAsync(payload, { secret: process.env.JWT_TOKEN_SECRET }),
        };
    }

    async register(newUser) {
        const user = await this.usersService.findOneByEmail(newUser.Email);

        if (user) {
            throw new BadRequestException("Email already exists");
        }

        const hashedPassword = await bcryptjs.hash(newUser.Password, 10);
        newUser.Password = hashedPassword;

        await this.usersService.create(newUser);

        return {
            message: "User created successfully",
        };
    }

    validateToken(token: string) {
        try {
            return this.jwtService.verify(token, { secret: process.env.JWT_TOKEN_SECRET });
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }
}
