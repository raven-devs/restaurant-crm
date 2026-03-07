import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SalesChannelsService } from './sales-channels.service';
import { CreateSalesChannelDto } from './dto/create-sales-channel.dto';
import { UpdateSalesChannelDto } from './dto/update-sales-channel.dto';

@Controller('sales-channels')
export class SalesChannelsController {
  constructor(private readonly salesChannelsService: SalesChannelsService) {}

  @Get()
  findAll() {
    return this.salesChannelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesChannelsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSalesChannelDto) {
    return this.salesChannelsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSalesChannelDto) {
    return this.salesChannelsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesChannelsService.remove(id);
  }
}
