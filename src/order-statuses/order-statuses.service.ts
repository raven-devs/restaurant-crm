import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderStatusesService {
  private readonly table = 'order_statuses';

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

  async create(dto: CreateOrderStatusDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .insert(dto)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateOrderStatusDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException(`Record ${id} not found`);
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
