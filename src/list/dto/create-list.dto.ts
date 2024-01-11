import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListDto {
  @IsString()
  @ApiProperty({ description: '리스트 타이틀', example: 'Todo' })
  @IsNotEmpty({ message: '타이틀을 입력해주세요.' })
  title: string;
}
