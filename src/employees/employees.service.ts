import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  private readonly table = 'employees';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from(this.table)
      .select('*, org_unit:org_units(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const userIds = data.map((e: any) => e.user_id).filter(Boolean);

    if (userIds.length === 0) return data;

    const { data: users, error: usersError } = await client.rpc(
      'get_user_emails',
      { user_ids: userIds },
    );

    if (usersError || !users) return data;

    const emailMap = new Map(users.map((u: any) => [u.id, u.email]));

    return data.map((e: any) => ({
      ...e,
      email: emailMap.get(e.user_id) ?? null,
    }));
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

  async create(dto: CreateEmployeeDto) {
    const client = this.supabase.getClient();
    const { email, password, ...employeeFields } = dto;

    let userId: string | undefined;
    if (email && password) {
      const { data: authUser, error: authError } =
        await client.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      if (authError) throw new ConflictException(authError.message);
      userId = authUser.user.id;
    }

    const { data, error } = await client
      .from(this.table)
      .insert({ ...employeeFields, user_id: userId ?? null })
      .select()
      .single();
    if (error) {
      if (userId) {
        await client.auth.admin.deleteUser(userId);
      }
      if (error.code === '23505')
        throw new ConflictException(`Employee "${dto.name}" already exists`);
      throw error;
    }
    return data;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const client = this.supabase.getClient();
    const { email, password, ...employeeFields } = dto;

    if (email || password) {
      const { data: employee } = await client
        .from(this.table)
        .select('user_id')
        .eq('id', id)
        .single();

      if (employee?.user_id) {
        const authUpdate: Record<string, string> = {};
        if (email) authUpdate.email = email;
        if (password) authUpdate.password = password;

        const { error: authError } = await client.auth.admin.updateUserById(
          employee.user_id,
          authUpdate,
        );
        if (authError) throw authError;
      }
    }

    if (Object.keys(employeeFields).length === 0) {
      const { data, error } = await client
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new NotFoundException(`Record ${id} not found`);
      return data;
    }

    const { data, error } = await client
      .from(this.table)
      .update(employeeFields)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(`Employee "${dto.name}" already exists`);
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
