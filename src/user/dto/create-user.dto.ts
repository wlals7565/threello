import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '이메일', example: 'test123456@email.com' })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty({ description: '닉네임', example: 'testNick' })
  readonly nick: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @IsNotEmpty()
  @ApiProperty({ description: '비밀번호', example: 'testpassword' })
  readonly password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @IsNotEmpty()
  @ApiProperty({ description: '비밀번호 재확인', example: 'testpassword' })
  readonly passwordConfirm: string;
}
