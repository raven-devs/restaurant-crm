import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  org_unit_id: string;

  @IsString()
  @IsOptional()
  user_id?: string;
}
