import { ApiProperty } from '@nestjs/swagger';

export class ResponseInterface {
  @ApiProperty({ description: 'HTTP 상태 코드' })
  code: number;

  @ApiProperty({ description: '응답 메세지' })
  message: string;
}
