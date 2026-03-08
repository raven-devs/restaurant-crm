import { Controller, Get, Patch, Body } from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Get()
  get() {
    return this.appSettingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdateAppSettingsDto) {
    return this.appSettingsService.update(dto);
  }
}
