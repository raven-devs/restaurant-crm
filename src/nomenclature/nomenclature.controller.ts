import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { NomenclatureService } from './nomenclature.service';
import { CreateNomenclatureItemDto } from './dto/create-nomenclature-item.dto';
import { UpdateNomenclatureItemDto } from './dto/update-nomenclature-item.dto';

@Controller('nomenclature')
export class NomenclatureController {
  constructor(private readonly nomenclatureService: NomenclatureService) {}

  @Get()
  findAll() {
    return this.nomenclatureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nomenclatureService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateNomenclatureItemDto) {
    return this.nomenclatureService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNomenclatureItemDto) {
    return this.nomenclatureService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nomenclatureService.remove(id);
  }
}
