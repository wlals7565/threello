import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}
  async signup(createUserDto: CreateUserDto) {
    const { nick, email, password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const exUser = await this.userRepository.findOneBy({ email });
    if (exUser) {
      throw new ConflictException('이미 회원가입이 되어있는 이메일입니다.');
    }
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nick,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Existing username');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return { code: 201, message: 'singup is finished' };
  }

  private async getUserByEmail(email: string) {
    try {
      return await this.userRepository.findOneBy({ email });
    } catch (error) {
      throw error;
    }
  }

  async signin(signinUserDto: SigninUserDto) {
    const { password, email } = signinUserDto;
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        const payload = { nick: user.nick, email };
        const accessToken: string = this.jwtService.sign(payload);
        return { accessToken };
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      throw new InternalServerErrorException('internal server error');
    }
  }

  async withdraw(user: User) {
    try {
      const originUserInfo = await this.getUserByEmail(user.email);

      const deletedUser = await this.userRepository.remove(originUserInfo);
      if (deletedUser) {
        return { code: 200, message: 'Withdrawal successful' };
      }
    } catch (error) {
      throw new InternalServerErrorException('Withdrawal failed');
    }
    throw new NotFoundException('Not Exiting User');
  }

  async patchMyInfo(user: User, nick: string) {
    try {
      const originUserInfo = await this.getUserByEmail(user.email);
      originUserInfo.nick = nick;
      await this.userRepository.save(originUserInfo);
      return { code: 200, message: 'My info updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update my info');
    }
  }
}
