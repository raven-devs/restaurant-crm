import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';
import { UpdateOrgUnitDto } from './dto/update-org-unit.dto';

@Injectable()
export class OrgStructureService {
  private readonly table = 'org_units';

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

  async create(dto: CreateOrgUnitDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .insert(dto)
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(`Org unit "${dto.name}" already exists`);
      throw error;
    }
    return data;
  }

  async update(id: string, dto: UpdateOrgUnitDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(`Org unit "${dto.name}" already exists`);
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
