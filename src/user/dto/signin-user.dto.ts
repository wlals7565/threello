import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SigninUserDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @IsNotEmpty()
  @ApiProperty({ description: '비밀번호', example: 'testpassword' })
  readonly password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '이메일', example: 'test123456@email.com' })
  readonly email: string;
}