import { PartialType } from '@nestjs/mapped-types';
import { CreateNomenclatureItemDto } from './create-nomenclature-item.dto';

export class UpdateNomenclatureItemDto extends PartialType(
  CreateNomenclatureItemDto,
) {}
