import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { UserAuthParams, Tokens } from 'src/utils/types';
import { IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist';
import { ForbiddenException } from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signupLocal(authDto: UserAuthParams): Promise<Tokens> {
    const hash = await this.hashData(authDto.password);
    const newUser = this.userRepository.create({
      email: authDto.email,
      hash,
    });
    await this.userRepository.save(newUser);

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    return tokens;
  }

  async signinLocal(authDto: UserAuthParams) {
    const user = await this.userRepository.findOne({
      where: {
        email: authDto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const passwordMatches = await bcrypt.compare(authDto.password, user.hash);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    return await this.userRepository.update(
      {
        id: userId,
        hashedRt: Not(IsNull()),
      },
      {
        hashedRt: null,
      },
    );
  }
  refreshTokens() {}

  async updateRtHash(userId: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.userRepository.update(
      { id: userId },
      {
        hashedRt: hash,
      },
    );
  }

  hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
