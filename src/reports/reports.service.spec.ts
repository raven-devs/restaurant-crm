import { Test } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { SupabaseService } from '../supabase/supabase.service';

function chainable() {
  const chain: Record<string, jest.Mock> = {};
  const methods = ['select', 'eq', 'gte', 'lte', 'order'];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.then = undefined as any;
  return chain;
}

describe('ReportsService', () => {
  let service: ReportsService;
  let mockClient: Record<string, any>;

  beforeEach(async () => {
    mockClient = { from: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: SupabaseService,
          useValue: { getClient: () => mockClient },
        },
      ],
    }).compile();

    service = module.get(ReportsService);
  });

  describe('getOrderReport', () => {
    const sampleOrder = {
      id: 'o1',
      order_date: '2024-06-15',
      created_at: new Date(Date.now() - 120 * 60000).toISOString(),
      client: { name: 'Alice', phone: '+380991234567' },
      status: { name: 'Accepted' },
      sales_channel: { name: 'Telegram' },
      accepted_by: { name: 'John' },
      items: [
        { id: 'i1', quantity: 2, price_at_order: 150 },
        { id: 'i2', quantity: 1, price_at_order: 200 },
      ],
    };

    it('returns mapped report rows', async () => {
      const chain = chainable();
      chain.then = jest.fn((resolve: any) => {
        resolve({ data: [sampleOrder], error: null });
        return Promise.resolve({ data: [sampleOrder], error: null });
      });
      chain.order.mockReturnValue(chain);
      mockClient.from.mockReturnValue(chain);

      const result = await service.getOrderReport({});
      expect(result).toHaveLength(1);

      const row = result[0];
      expect(row.id).toBe('o1');
      expect(row.client_name).toBe('Alice');
      expect(row.client_phone).toBe('+380991234567');
      expect(row.items_count).toBe(2);
      expect(row.total).toBe(500);
      expect(row.sales_channel_name).toBe('Telegram');
      expect(row.status_name).toBe('Accepted');
      expect(row.accepted_by_name).toBe('John');
      expect(row.time_since_creation).toBeGreaterThan(0);
      expect(row.time_per_stage).toBeNull();
    });

    it('applies date filters', async () => {
      const chain = chainable();
      chain.then = jest.fn((resolve: any) => {
        resolve({ data: [], error: null });
        return Promise.resolve({ data: [], error: null });
      });
      chain.order.mockReturnValue(chain);
      chain.gte.mockReturnValue(chain);
      chain.lte.mockReturnValue(chain);
      mockClient.from.mockReturnValue(chain);

      await service.getOrderReport({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
      });

      expect(chain.gte).toHaveBeenCalledWith('order_date', '2024-01-01');
      expect(chain.lte).toHaveBeenCalledWith('order_date', '2024-12-31');
    });

    it('applies status, client, and channel filters', async () => {
      const chain = chainable();
      chain.then = jest.fn((resolve: any) => {
        resolve({ data: [], error: null });
        return Promise.resolve({ data: [], error: null });
      });
      chain.order.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      mockClient.from.mockReturnValue(chain);

      await service.getOrderReport({
        status_id: 's1',
        client_id: 'c1',
        sales_channel_id: 'ch1',
      });

      expect(chain.eq).toHaveBeenCalledWith('status_id', 's1');
      expect(chain.eq).toHaveBeenCalledWith('client_id', 'c1');
      expect(chain.eq).toHaveBeenCalledWith('sales_channel_id', 'ch1');
    });

    it('handles missing relations gracefully', async () => {
      const orderWithNulls = {
        id: 'o2',
        order_date: '2024-06-15',
        created_at: new Date().toISOString(),
        client: null,
        status: null,
        sales_channel: null,
        accepted_by: null,
        items: null,
      };

      const chain = chainable();
      chain.then = jest.fn((resolve: any) => {
        resolve({ data: [orderWithNulls], error: null });
        return Promise.resolve({ data: [orderWithNulls], error: null });
      });
      chain.order.mockReturnValue(chain);
      mockClient.from.mockReturnValue(chain);

      const result = await service.getOrderReport({});
      const row = result[0];
      expect(row.client_name).toBe('—');
      expect(row.client_phone).toBe('—');
      expect(row.items_count).toBe(0);
      expect(row.total).toBe(0);
      expect(row.sales_channel_name).toBe('—');
      expect(row.status_name).toBe('—');
      expect(row.accepted_by_name).toBeNull();
    });

    it('throws when supabase returns error', async () => {
      const chain = chainable();
      chain.then = jest.fn((resolve: any) => {
        resolve({ data: null, error: new Error('db error') });
        return Promise.resolve({ data: null, error: new Error('db error') });
      });
      chain.order.mockReturnValue(chain);
      mockClient.from.mockReturnValue(chain);

      await expect(service.getOrderReport({})).rejects.toThrow('db error');
    });
  });
});
