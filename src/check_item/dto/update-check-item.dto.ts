import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class UpdateCheckItemDto {
  @IsString()
  @IsNotEmpty({ message: '컨텐츠를 입력해주세요.' })
  @ApiProperty({ description: '체크 아이템 내용', example: 'checkItemContent' })
  content: string;

  @IsBoolean()
  @IsNotEmpty({ message: '상태를 입력해주세요' })
  @ApiProperty({ description: `작업 완료 여부`, example: true })
  is_done: boolean;
}
