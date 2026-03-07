import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async login(email: string, password: string) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({ email, password });
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
}
