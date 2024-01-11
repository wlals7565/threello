import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({
    description: '작업자 할당입니다.',
    example: '[{"id":1},{"id":2}]',
  })
  @IsNotEmpty()
  @IsArray()
  userIds: { id: number }[];
}
