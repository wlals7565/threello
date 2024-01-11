import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class SigninUserDto extends OmitType(CreateUserDto, [
  'passwordConfirm',
  'password',
  'email',
]) {}
