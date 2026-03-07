import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSalesChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
