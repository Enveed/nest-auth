import {
  Controller,
  Post,
  Body,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { Tokens } from 'src/utils/types';
import { AuthDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(authDto);
  }

  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(authDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return this.authService.logout;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens() {
    return this.authService.refreshTokens;
  }
}
