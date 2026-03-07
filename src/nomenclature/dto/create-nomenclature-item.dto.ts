import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateNomenclatureItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;
}
