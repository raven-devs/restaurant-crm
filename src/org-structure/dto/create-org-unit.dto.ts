import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrgUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
