import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  previous_status_id?: string;

  @IsString()
  @IsOptional()
  next_status_id?: string;

  @IsNumber()
  @IsOptional()
  max_time_unconfirmed?: number;

  @IsNumber()
  @IsOptional()
  max_time_in_status?: number;

  @IsString()
  @IsOptional()
  escalation_action?: string;

  @IsNumber()
  sort_order: number;
}
