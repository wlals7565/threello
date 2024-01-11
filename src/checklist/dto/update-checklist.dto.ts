import { PickType } from '@nestjs/swagger';
import { CreateCheckListDto } from './create-checklist.dto';

export class UpdateCheckListDto extends PickType(CreateCheckListDto, [
  'title',
]) {}
