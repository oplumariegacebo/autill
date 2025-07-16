import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('Auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.Email, signInDto.Password);
    }

    @Post('register')
    register(@Body() registerDto: Record<string, any>) {
      return this.authService.register(registerDto);
    }
}
