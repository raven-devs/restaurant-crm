import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSalesChannelDto } from './dto/create-sales-channel.dto';
import { UpdateSalesChannelDto } from './dto/update-sales-channel.dto';

@Injectable()
export class SalesChannelsService {
  private readonly table = 'sales_channels';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(`Record ${id} not found`);
    return data;
  }

  async create(dto: CreateSalesChannelDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .insert(dto)
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(
          `Sales channel "${dto.name}" already exists`,
        );
      throw error;
    }
    return data;
  }

  async update(id: string, dto: UpdateSalesChannelDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(
          `Sales channel "${dto.name}" already exists`,
        );
      throw new NotFoundException(`Record ${id} not found`);
    }
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase
      .getClient()
      .from(this.table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
