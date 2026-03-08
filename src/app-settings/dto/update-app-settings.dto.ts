import { IsString, IsOptional } from 'class-validator';

export class UpdateAppSettingsDto {
  @IsString()
  @IsOptional()
  currency?: string;
}
