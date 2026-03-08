import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private url: string;
  private serviceRoleKey: string;

  constructor(private configService: ConfigService) {
    this.url = this.configService.getOrThrow<string>('SUPABASE_PROJECT_URL');
    this.serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.client = createClient(this.url, this.serviceRoleKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  createAuthClient(): SupabaseClient {
    return createClient(this.url, this.serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
}
