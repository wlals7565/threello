import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '../../user/entities/user.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../user/user.repository';
import { ConfigService } from '@nestjs/config';

//너무나도 궁금하다 userRepository를 exports한 적이 없는데 어떻게 사용 가능한 것인가?
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {
    const { email } = payload;
    const user: User = await this.userRepository.findOne({
      where: { email },
      relations: ['boardMembers', 'boardMembers.board'], // 여기에 가져오고자 하는 관계를 명시합니다.
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
