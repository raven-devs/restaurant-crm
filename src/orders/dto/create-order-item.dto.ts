import { IsString, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  nomenclature_item_id: string;

  @IsNumber()
  quantity: number;
}
