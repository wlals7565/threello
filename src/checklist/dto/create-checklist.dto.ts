import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCheckListDto {
  @IsNumber()
  @IsNotEmpty({ message: '카드 아이디를 입력해주세요.' })
  @ApiProperty({ description: '카드 아이디', example: 1 })
  card_id: number;

  @IsString()
  @IsNotEmpty({ message: '타이틀을 입력해주세요.' })
  @ApiProperty({ description: '카드 아이디', example: 'cardTitle' })
  title: string;
}
