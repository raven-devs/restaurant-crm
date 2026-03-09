import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { SupabaseService } from './supabase/supabase.service';

export interface HealthCheck {
  status: 'ok' | 'error';
  checks: {
    server: { status: 'ok' };
    supabase: { status: 'ok' | 'error'; error?: string };
    sentry: { status: 'ok' | 'not_configured'; error?: string };
  };
}

@Injectable()
export class AppService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<HealthCheck> {
    const supabase = await this.checkSupabase();
    const sentry = this.checkSentry();

    return {
      status: supabase.status === 'ok' ? 'ok' : 'error',
      checks: {
        server: { status: 'ok' },
        supabase,
        sentry,
      },
    };
  }

  private async checkSupabase(): Promise<{
    status: 'ok' | 'error';
    error?: string;
  }> {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .from('order_statuses')
        .select('id')
        .limit(1);
      if (error) return { status: 'error', error: error.message };
      return { status: 'ok' };
    } catch (e) {
      return {
        status: 'error',
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }

  private checkSentry(): {
    status: 'ok' | 'not_configured';
    error?: string;
  } {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    if (!dsn) return { status: 'not_configured' };

    try {
      const client = Sentry.getClient();
      if (!client) return { status: 'not_configured' };
      return { status: 'ok' };
    } catch (e) {
      return {
        status: 'not_configured',
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
