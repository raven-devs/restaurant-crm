import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ORDER_STATUS_IDS } from '../../shared/constants/order-statuses';

function chainable() {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'in',
    'gte',
    'lte',
    'is',
    'order',
  ];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.single = jest.fn();
  chain.then = undefined as any;
  return chain;
}

describe('OrdersService', () => {
  let service: OrdersService;
  let mockClient: Record<string, any>;

  beforeEach(async () => {
    mockClient = { from: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: SupabaseService,
          useValue: { getClient: () => mockClient },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  describe('create', () => {
    const dto = {
      client_id: 'c1',
      sales_channel_id: 'sc1',
      items: [{ nomenclature_item_id: 'n1', quantity: 2 }],
    };

    it('creates order with items and status history', async () => {
      const nomChain = chainable();
      nomChain.in.mockReturnValue(
        Promise.resolve({
          data: [{ id: 'n1', price: 100 }],
          error: null,
        }),
      );

      const orderChain = chainable();
      orderChain.single.mockResolvedValue({
        data: { id: 'o1', status_id: ORDER_STATUS_IDS.NEW },
        error: null,
      });

      const itemsChain = chainable();
      itemsChain.select.mockReturnValue(
        Promise.resolve({
          data: [{ id: 'oi1', quantity: 2, price_at_order: 100 }],
          error: null,
        }),
      );

      const historyChain = chainable();
      historyChain.insert.mockReturnValue(Promise.resolve({ error: null }));

      mockClient.from.mockImplementation((table: string) => {
        const map: Record<string, any> = {
          nomenclature_items: nomChain,
          orders: orderChain,
          order_items: itemsChain,
          order_status_history: historyChain,
        };
        return map[table];
      });

      const result = await service.create(dto);
      expect(result.id).toBe('o1');
      expect(result.items).toHaveLength(1);
      expect(mockClient.from).toHaveBeenCalledWith('nomenclature_items');
      expect(mockClient.from).toHaveBeenCalledWith('orders');
      expect(mockClient.from).toHaveBeenCalledWith('order_items');
      expect(mockClient.from).toHaveBeenCalledWith('order_status_history');
    });

    it('throws NotFoundException when nomenclature item missing', async () => {
      const nomChain = chainable();
      nomChain.in.mockReturnValue(Promise.resolve({ data: [], error: null }));

      mockClient.from.mockReturnValue(nomChain);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all orders without filters', async () => {
      const chain = chainable();
      chain.order.mockReturnValue(
        Promise.resolve({
          data: [{ id: 'o1' }, { id: 'o2' }],
          error: null,
        }),
      );
      mockClient.from.mockReturnValue(chain);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('applies filters when provided', async () => {
      const chain = chainable();
      chain.order.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.gte.mockReturnValue(chain);
      chain.lte.mockReturnValue(chain);
      chain.then = jest.fn((resolve: any) => {
        resolve({ data: [], error: null });
        return Promise.resolve({ data: [], error: null });
      });

      mockClient.from.mockReturnValue(chain);

      await service.findAll({
        status_id: 's1',
        client_id: 'c1',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
      });

      expect(chain.eq).toHaveBeenCalledWith('status_id', 's1');
      expect(chain.eq).toHaveBeenCalledWith('client_id', 'c1');
      expect(chain.gte).toHaveBeenCalledWith('order_date', '2024-01-01');
      expect(chain.lte).toHaveBeenCalledWith('order_date', '2024-12-31');
    });

    it('throws when supabase returns error', async () => {
      const chain = chainable();
      chain.order.mockReturnValue(
        Promise.resolve({
          data: null,
          error: new Error('db error'),
        }),
      );
      mockClient.from.mockReturnValue(chain);

      await expect(service.findAll()).rejects.toThrow('db error');
    });
  });

  describe('findOne', () => {
    it('returns order with relations', async () => {
      const chain = chainable();
      chain.single.mockResolvedValue({
        data: { id: 'o1', client: { name: 'Alice' } },
        error: null,
      });
      mockClient.from.mockReturnValue(chain);

      const result = await service.findOne('o1');
      expect(result.id).toBe('o1');
    });

    it('throws NotFoundException when order missing', async () => {
      const chain = chainable();
      chain.single.mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      });
      mockClient.from.mockReturnValue(chain);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('advances order to next status', async () => {
      const chain = chainable();
      let callCount = 0;

      chain.single.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: 'o1',
              status_id: ORDER_STATUS_IDS.NEW,
              status: {
                name: 'New',
                next_status_id: ORDER_STATUS_IDS.ACCEPTED,
              },
            },
            error: null,
          });
        }
        return Promise.resolve({
          data: { id: 'o1', status_id: ORDER_STATUS_IDS.ACCEPTED },
          error: null,
        });
      });

      chain.is.mockReturnValue(Promise.resolve({ error: null }));
      chain.insert.mockReturnValue(Promise.resolve({ error: null }));

      mockClient.from.mockReturnValue(chain);

      const result = await service.transitionStatus('o1', 'emp1');
      expect(result.status_id).toBe(ORDER_STATUS_IDS.ACCEPTED);
    });

    it('throws BadRequestException at final status', async () => {
      const chain = chainable();
      chain.single.mockResolvedValue({
        data: {
          id: 'o1',
          status: { name: 'Closed', next_status_id: null },
        },
        error: null,
      });
      mockClient.from.mockReturnValue(chain);

      await expect(service.transitionStatus('o1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when order not found', async () => {
      const chain = chainable();
      chain.single.mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      });
      mockClient.from.mockReturnValue(chain);

      await expect(service.transitionStatus('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes items, history, then order', async () => {
      const chain = chainable();
      chain.eq.mockReturnValue(Promise.resolve({ error: null }));
      mockClient.from.mockReturnValue(chain);

      await expect(service.remove('o1')).resolves.toBeUndefined();
      expect(mockClient.from).toHaveBeenCalledWith('order_items');
      expect(mockClient.from).toHaveBeenCalledWith('order_status_history');
      expect(mockClient.from).toHaveBeenCalledWith('orders');
    });

    it('throws when deleting items fails', async () => {
      const chain = chainable();
      chain.eq.mockReturnValue(
        Promise.resolve({ error: new Error('fk constraint') }),
      );
      mockClient.from.mockReturnValue(chain);

      await expect(service.remove('o1')).rejects.toThrow('fk constraint');
    });
  });

  describe('addItem', () => {
    it('adds item with price snapshot', async () => {
      const nomChain = chainable();
      nomChain.single.mockResolvedValue({
        data: { id: 'n1', price: 250 },
        error: null,
      });

      const itemChain = chainable();
      itemChain.single.mockResolvedValue({
        data: { id: 'oi1', price_at_order: 250, quantity: 3 },
        error: null,
      });

      mockClient.from.mockImplementation((table: string) =>
        table === 'nomenclature_items' ? nomChain : itemChain,
      );

      const result = await service.addItem('o1', {
        nomenclature_item_id: 'n1',
        quantity: 3,
      });
      expect(result.price_at_order).toBe(250);
    });

    it('throws NotFoundException for unknown nomenclature item', async () => {
      const chain = chainable();
      chain.single.mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      });
      mockClient.from.mockReturnValue(chain);

      await expect(
        service.addItem('o1', {
          nomenclature_item_id: 'unknown',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateItem', () => {
    it('updates item quantity', async () => {
      const chain = chainable();
      chain.single.mockResolvedValue({
        data: { id: 'oi1', quantity: 5 },
        error: null,
      });
      mockClient.from.mockReturnValue(chain);

      const result = await service.updateItem('o1', 'oi1', { quantity: 5 });
      expect(result.quantity).toBe(5);
    });

    it('throws NotFoundException when item not found', async () => {
      const chain = chainable();
      chain.single.mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      });
      mockClient.from.mockReturnValue(chain);

      await expect(
        service.updateItem('o1', 'missing', { quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('deletes the order item', async () => {
      const chain = chainable();
      let eqCallCount = 0;
      chain.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount >= 2) {
          return Promise.resolve({ error: null });
        }
        return chain;
      });
      mockClient.from.mockReturnValue(chain);

      await expect(service.removeItem('o1', 'oi1')).resolves.toBeUndefined();
    });
  });
});
