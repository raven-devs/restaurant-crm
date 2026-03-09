import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { TelegramService } from '../telegram/telegram.service';
import { ORDER_STATUS_IDS } from '../../shared/constants/order-statuses';
import { t } from '../i18n/i18n';

interface StatusLimits {
  max_time_unconfirmed: number | null;
  max_time_in_status: number | null;
  escalation_action: string | null;
  name: string;
}

@Injectable()
export class OrderMonitoringService {
  private readonly logger = new Logger(OrderMonitoringService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly telegram: TelegramService,
  ) {}

  @Interval(60_000)
  async checkOverdueOrders() {
    try {
      const client = this.supabase.getClient();

      const { data: statuses, error: statusError } = await client
        .from('order_statuses')
        .select(
          'id, name, max_time_unconfirmed, max_time_in_status, escalation_action',
        );
      if (statusError) {
        this.logger.error(
          'Failed to fetch order statuses',
          statusError.message,
        );
        return;
      }

      const statusMap = new Map<string, StatusLimits>();
      for (const s of statuses) {
        if (s.max_time_unconfirmed || s.max_time_in_status) {
          statusMap.set(s.id, s);
        }
      }

      if (statusMap.size === 0) return;

      const { data: orders, error: ordersError } = await client
        .from('orders')
        .select('id, color, status_id, client:clients(name)')
        .eq('color', 'green')
        .neq('status_id', ORDER_STATUS_IDS.CLOSED);
      if (ordersError) {
        this.logger.error('Failed to fetch orders', ordersError.message);
        return;
      }

      if (!orders?.length) return;

      const orderIds = orders.map((o) => o.id);
      const { data: activeHistory, error: historyError } = await client
        .from('order_status_history')
        .select('order_id, status_id, entered_at')
        .in('order_id', orderIds)
        .is('exited_at', null);
      if (historyError) {
        this.logger.error(
          'Failed to fetch status history',
          historyError.message,
        );
        return;
      }

      const historyByOrder = new Map<
        string,
        { status_id: string; entered_at: string }
      >();
      for (const h of activeHistory ?? []) {
        historyByOrder.set(h.order_id, h);
      }

      const now = Date.now();
      const toUpdate: string[] = [];
      const alerts: string[] = [];

      for (const order of orders) {
        const history = historyByOrder.get(order.id);
        if (!history) continue;

        const limits = statusMap.get(history.status_id);
        if (!limits) continue;

        const elapsedMinutes =
          (now - new Date(history.entered_at).getTime()) / 60_000;

        const exceeded =
          (limits.max_time_unconfirmed &&
            elapsedMinutes > limits.max_time_unconfirmed) ||
          (limits.max_time_in_status &&
            elapsedMinutes > limits.max_time_in_status);

        if (!exceeded) continue;

        toUpdate.push(order.id);

        if (limits.escalation_action && limits.escalation_action !== 'none') {
          const clientName = (order.client as any)?.name ?? 'Unknown';
          const elapsed = Math.round(elapsedMinutes);
          const base = t('monitoring.overdue', {
            id: order.id.slice(0, 8),
            client: clientName,
            status: limits.name,
            elapsed,
          });

          switch (limits.escalation_action) {
            case 'send_telegram_alert':
              alerts.push(base);
              break;
            case 'notify_manager':
              alerts.push(t('monitoring.manager', { message: base }));
              break;
            case 'auto_escalate':
              alerts.push(t('monitoring.escalated', { message: base }));
              break;
          }
        }
      }

      if (toUpdate.length > 0) {
        const { error: updateError } = await client
          .from('orders')
          .update({ color: 'red', updated_at: new Date().toISOString() })
          .in('id', toUpdate);
        if (updateError) {
          this.logger.error(
            'Failed to update order colors',
            updateError.message,
          );
        } else {
          this.logger.log(`Marked ${toUpdate.length} order(s) as red`);
        }
      }

      for (const alert of alerts) {
        try {
          await this.telegram.sendAlert(alert);
        } catch (err) {
          this.logger.error(
            'Failed to send Telegram alert',
            (err as Error).message,
          );
        }
      }
    } catch (err) {
      this.logger.error(
        'Order monitoring check failed',
        (err as Error).message,
      );
    }
  }
}
