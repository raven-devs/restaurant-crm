import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';

@Injectable()
export class AppSettingsService {
  private readonly table = 'app_settings';

  constructor(private readonly supabase: SupabaseService) {}

  async get() {
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .select('*')
      .limit(1)
      .single();
    if (error) throw new NotFoundException('Settings not found');
    return data;
  }

  async update(dto: UpdateAppSettingsDto) {
    const current = await this.get();
    const { data, error } = await this.supabase
      .getClient()
      .from(this.table)
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', current.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
