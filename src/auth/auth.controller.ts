import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('logout')
  logout(@Req() request: Request) {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Missing authorization token');
    return this.authService.logout(token);
  }

  @Get('me')
  async me(@Req() request: Request) {
    const authUser = (request as unknown as Record<string, unknown>)[
      'user'
    ] as {
      id: string;
      email: string;
    };
    const profile = await this.authService.getProfile(authUser.id);
    return {
      id: authUser.id,
      email: authUser.email,
      ...profile,
    };
  }
}
