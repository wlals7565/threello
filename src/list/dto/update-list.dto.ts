import { PickType } from '@nestjs/swagger';
import { CreateListDto } from './create-list.dto';

export class UpdateListDto extends PickType(CreateListDto, ['title']) {}
