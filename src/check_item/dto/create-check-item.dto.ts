import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCheckItemDto {
  @IsNumber()
  @IsNotEmpty({ message: '체크리스트 아이디를 입력해주세요.' })
  @ApiProperty({ description: '체크리스트 아이디', example: 1 })
  checklist_id: number;

  @IsString()
  @IsNotEmpty({ message: '컨텐츠를 입력해주세요.' })
  @ApiProperty({
    description: '체크리스트 어아탬 내용',
    example: 'checkItemContent',
  })
  content: string;
}
