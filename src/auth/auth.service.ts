import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async login(email: string, password: string) {
    const authClient = this.supabase.createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new UnauthorizedException(error.message);
    return data.session;
  }

  async logout(token: string) {
    const { error } = await this.supabase.getClient().auth.admin.signOut(token);
    if (error) throw new UnauthorizedException(error.message);
  }

  async getUser(token: string) {
    const { data, error } = await this.supabase.getClient().auth.getUser(token);
    if (error) throw new UnauthorizedException(error.message);
    return data.user;
  }

  async getProfile(userId: string) {
    const { data } = await this.supabase
      .getClient()
      .from('employees')
      .select('id, name, org_units(name)')
      .eq('user_id', userId)
      .single();

    return {
      employee_id: data?.id ?? null,
      employee_name: data?.name ?? null,
      org_unit_name:
        (data?.org_units as unknown as { name: string })?.name ?? null,
    };
  }
}
