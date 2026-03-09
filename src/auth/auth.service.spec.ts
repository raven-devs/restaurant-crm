import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockClient: Record<string, any>;
  let mockAuthClient: Record<string, any>;

  beforeEach(async () => {
    mockClient = {
      from: jest.fn(),
      auth: {
        getUser: jest.fn(),
        admin: { signOut: jest.fn() },
      },
    };

    mockAuthClient = {
      auth: {
        signInWithPassword: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockClient,
            createAuthClient: () => mockAuthClient,
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('returns session on valid credentials', async () => {
      const session = { access_token: 'token-123', user: { id: 'u1' } };
      mockAuthClient.auth.signInWithPassword.mockResolvedValue({
        data: { session },
        error: null,
      });

      const result = await service.login('user@test.com', 'pass');
      expect(result).toEqual(session);
      expect(mockAuthClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'pass',
      });
    });

    it('throws UnauthorizedException on invalid credentials', async () => {
      mockAuthClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login('bad@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('succeeds when token is valid', async () => {
      mockClient.auth.admin.signOut.mockResolvedValue({ error: null });

      await expect(service.logout('valid-token')).resolves.toBeUndefined();
      expect(mockClient.auth.admin.signOut).toHaveBeenCalledWith('valid-token');
    });

    it('throws UnauthorizedException on error', async () => {
      mockClient.auth.admin.signOut.mockResolvedValue({
        error: { message: 'Invalid token' },
      });

      await expect(service.logout('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUser', () => {
    it('returns user for valid token', async () => {
      const user = { id: 'u1', email: 'user@test.com' };
      mockClient.auth.getUser.mockResolvedValue({
        data: { user },
        error: null,
      });

      const result = await service.getUser('valid-token');
      expect(result).toEqual(user);
    });

    it('throws UnauthorizedException for invalid token', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(service.getUser('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('returns employee profile when found', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'emp1', name: 'John', org_units: { name: 'Kitchen' } },
          error: null,
        }),
      };
      mockClient.from = jest.fn().mockReturnValue(chain);

      const result = await service.getProfile('user-id');
      expect(result).toEqual({
        employee_id: 'emp1',
        employee_name: 'John',
        org_unit_name: 'Kitchen',
      });
      expect(mockClient.from).toHaveBeenCalledWith('employees');
    });

    it('returns nulls when employee not found', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockClient.from = jest.fn().mockReturnValue(chain);

      const result = await service.getProfile('unknown-id');
      expect(result).toEqual({
        employee_id: null,
        employee_name: null,
        org_unit_name: null,
      });
    });
  });
});
