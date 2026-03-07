import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { OrgStructureService } from './org-structure.service';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';
import { UpdateOrgUnitDto } from './dto/update-org-unit.dto';

@Controller('org-units')
export class OrgStructureController {
  constructor(private readonly orgStructureService: OrgStructureService) {}

  @Get()
  findAll() {
    return this.orgStructureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgStructureService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrgUnitDto) {
    return this.orgStructureService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrgUnitDto) {
    return this.orgStructureService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orgStructureService.remove(id);
  }
}
