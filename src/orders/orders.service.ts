import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ORDER_STATUS_IDS } from '../../shared/constants/order-statuses';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

interface FindAllFilters {
  status_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(dto: CreateOrderDto) {
    const client = this.supabase.getClient();

    const nomenclatureIds = dto.items.map((i) => i.nomenclature_item_id);
    const { data: nomenclatureItems, error: nomError } = await client
      .from('nomenclature_items')
      .select('id, price')
      .in('id', nomenclatureIds);
    if (nomError) throw nomError;

    const priceMap = new Map(
      nomenclatureItems.map((item) => [item.id, item.price]),
    );
    for (const item of dto.items) {
      if (!priceMap.has(item.nomenclature_item_id)) {
        throw new NotFoundException(
          `Nomenclature item ${item.nomenclature_item_id} not found`,
        );
      }
    }

    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        client_id: dto.client_id,
        sales_channel_id: dto.sales_channel_id,
        order_point: dto.order_point ?? null,
        status_id: ORDER_STATUS_IDS.NEW,
        color: 'green',
        order_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItemsPayload = dto.items.map((item) => ({
      order_id: order.id,
      nomenclature_item_id: item.nomenclature_item_id,
      quantity: item.quantity,
      price_at_order: priceMap.get(item.nomenclature_item_id),
    }));

    const { data: orderItems, error: itemsError } = await client
      .from('order_items')
      .insert(orderItemsPayload)
      .select('*, nomenclature_item:nomenclature_items(*)');
    if (itemsError) throw itemsError;

    const { error: historyError } = await client
      .from('order_status_history')
      .insert({
        order_id: order.id,
        status_id: ORDER_STATUS_IDS.NEW,
        entered_at: new Date().toISOString(),
      });
    if (historyError) throw historyError;

    return { ...order, items: orderItems };
  }

  async findAll(filters?: FindAllFilters) {
    const query = this.supabase
      .getClient()
      .from('orders')
      .select(
        '*, client:clients(*), status:order_statuses(*), sales_channel:sales_channels(*)',
      )
      .order('created_at', { ascending: false });

    if (filters?.status_id) {
      query.eq('status_id', filters.status_id);
    }
    if (filters?.client_id) {
      query.eq('client_id', filters.client_id);
    }
    if (filters?.date_from) {
      query.gte('order_date', filters.date_from);
    }
    if (filters?.date_to) {
      query.lte('order_date', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select(
        '*, client:clients(*), status:order_statuses(*), sales_channel:sales_channels(*), accepted_by:employees(*), items:order_items(*, nomenclature_item:nomenclature_items(*)), status_history:order_status_history(*, status:order_statuses(*))',
      )
      .eq('id', id)
      .order('entered_at', {
        ascending: true,
        referencedTable: 'order_status_history',
      })
      .single();
    if (error) throw new NotFoundException(`Order ${id} not found`);
    return data;
  }

  async transitionStatus(orderId: string, employeeId?: string) {
    const client = this.supabase.getClient();

    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*, status:order_statuses(*)')
      .eq('id', orderId)
      .single();
    if (orderError) throw new NotFoundException(`Order ${orderId} not found`);

    const nextStatusId = order.status.next_status_id;
    if (!nextStatusId) {
      throw new BadRequestException('Order is already at final status');
    }

    const { error: exitError } = await client
      .from('order_status_history')
      .update({ exited_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .is('exited_at', null);
    if (exitError) throw exitError;

    const { error: historyError } = await client
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status_id: nextStatusId,
        entered_at: new Date().toISOString(),
        changed_by_id: employeeId ?? null,
      });
    if (historyError) throw historyError;

    const updatePayload: Record<string, unknown> = {
      status_id: nextStatusId,
      color: 'green',
      updated_at: new Date().toISOString(),
    };

    if (nextStatusId === ORDER_STATUS_IDS.ACCEPTED && employeeId) {
      updatePayload.accepted_by_id = employeeId;
    }

    const { data: updatedOrder, error: updateError } = await client
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select(
        '*, client:clients(*), status:order_statuses(*), sales_channel:sales_channels(*), accepted_by:employees(*)',
      )
      .single();
    if (updateError) throw updateError;

    return updatedOrder;
  }

  async addItem(orderId: string, dto: CreateOrderItemDto) {
    const client = this.supabase.getClient();

    const { data: nomenclature, error: nomError } = await client
      .from('nomenclature_items')
      .select('id, price')
      .eq('id', dto.nomenclature_item_id)
      .single();
    if (nomError) {
      throw new NotFoundException(
        `Nomenclature item ${dto.nomenclature_item_id} not found`,
      );
    }

    const { data, error } = await client
      .from('order_items')
      .insert({
        order_id: orderId,
        nomenclature_item_id: dto.nomenclature_item_id,
        quantity: dto.quantity,
        price_at_order: nomenclature.price,
      })
      .select('*, nomenclature_item:nomenclature_items(*)')
      .single();
    if (error) throw error;
    return data;
  }

  async updateItem(orderId: string, itemId: string, dto: { quantity: number }) {
    const { data, error } = await this.supabase
      .getClient()
      .from('order_items')
      .update({ quantity: dto.quantity })
      .eq('id', itemId)
      .eq('order_id', orderId)
      .select('*, nomenclature_item:nomenclature_items(*)')
      .single();
    if (error)
      throw new NotFoundException(
        `Order item ${itemId} not found in order ${orderId}`,
      );
    return data;
  }

  async removeItem(orderId: string, itemId: string) {
    const { error } = await this.supabase
      .getClient()
      .from('order_items')
      .delete()
      .eq('id', itemId)
      .eq('order_id', orderId);
    if (error) throw error;
  }
}
