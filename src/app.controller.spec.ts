import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({
              from: () => ({
                select: () => ({
                  limit: () => Promise.resolve({ error: null }),
                }),
              }),
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: () => undefined },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return health status', async () => {
      const result = await appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result.checks.server.status).toBe('ok');
      expect(result.checks.supabase.status).toBe('ok');
      expect(result.checks.sentry.status).toBe('not_configured');
    });
  });
});
