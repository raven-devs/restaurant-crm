import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useOrders';
import {
  useClients,
  useNomenclature,
  useSalesChannels,
} from '@/hooks/useReferences';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/IconButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

interface OrderItemRow {
  nomenclature_item_id: string;
  quantity: number;
}

interface OrderFormValues {
  client_id: string;
  sales_channel_id: string;
}

export function CreateOrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { query: clientsQuery } = useClients();
  const { query: nomenclatureQuery } = useNomenclature();
  const { query: channelsQuery } = useSalesChannels();
  const { settings } = useSettings();
  const currency = settings?.currency ?? 'UAH';

  const { handleSubmit } = useForm<OrderFormValues>();
  const [clientId, setClientId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [newItemId, setNewItemId] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  const addItem = () => {
    if (!newItemId) return;
    const existing = items.find((i) => i.nomenclature_item_id === newItemId);
    if (existing) {
      setItems(
        items.map((i) =>
          i.nomenclature_item_id === newItemId
            ? { ...i, quantity: i.quantity + Number(newItemQty) }
            : i,
        ),
      );
    } else {
      setItems([
        ...items,
        { nomenclature_item_id: newItemId, quantity: Number(newItemQty) },
      ]);
    }
    setNewItemId('');
    setNewItemQty('1');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const onSubmit = () => {
    if (!clientId || !channelId || items.length === 0) {
      toast.error(t('orders.fillAllFields'));
      return;
    }
    createOrder.mutate(
      { client_id: clientId, sales_channel_id: channelId, items },
      {
        onSuccess: (order) => {
          toast.success(t('orders.orderCreated'));
          navigate(`/orders/${order.id}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const nomenclatureMap = new Map(
    (nomenclatureQuery.data ?? []).map((n) => [n.id, n]),
  );

  const selectedClient = clientsQuery.data?.find((c) => c.id === clientId);
  const selectedChannel = channelsQuery.data?.find((ch) => ch.id === channelId);
  const selectedNewItem = nomenclatureMap.get(newItemId);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-lg font-semibold">{t('orders.newOrder')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t('orders.client')}</Label>
          <Select
            value={clientId}
            onValueChange={(val) => setClientId(val ?? '')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.selectClient')}>
                {selectedClient
                  ? `${selectedClient.name} (${selectedClient.phone})`
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clientsQuery.data?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t('orders.salesChannel')}</Label>
          <Select
            value={channelId}
            onValueChange={(val) => setChannelId(val ?? '')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('orders.selectChannel')}>
                {selectedChannel?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {channelsQuery.data?.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('orders.items')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {items.map((item, idx) => {
              const nom = nomenclatureMap.get(item.nomenclature_item_id);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">
                    {nom?.name ?? item.nomenclature_item_id}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {((nom?.price ?? 0) * item.quantity).toLocaleString(
                      'uk-UA',
                      { minimumFractionDigits: 2 },
                    )}{' '}
                    {currency}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    x{item.quantity}
                  </span>
                  <IconButton
                    tooltip={t('orders.remove')}
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="hover:bg-red-100 hover:text-red-600"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              );
            })}

            {items.length > 0 && (
              <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                <span>{t('orders.total', { currency })}</span>
                <span>
                  {items
                    .reduce((sum, item) => {
                      const nom = nomenclatureMap.get(
                        item.nomenclature_item_id,
                      );
                      return sum + (nom?.price ?? 0) * item.quantity;
                    }, 0)
                    .toLocaleString('uk-UA', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>{t('orders.product')}</Label>
                <Select
                  value={newItemId}
                  onValueChange={(val) => setNewItemId(val ?? '')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('orders.selectProduct')}>
                      {selectedNewItem
                        ? `${selectedNewItem.name} — ${selectedNewItem.price} ${currency}`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {nomenclatureQuery.data?.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name} — {n.price} {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-20 flex-col gap-1.5">
                <Label>{t('orders.qty')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                />
              </div>
              <IconButton
                tooltip={t('orders.addItem')}
                type="button"
                variant="outline"
                size="icon"
                onClick={addItem}
              >
                <Plus />
              </IconButton>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/orders')}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending
              ? t('orders.creating')
              : t('orders.createOrder')}
          </Button>
        </div>
      </form>
    </div>
  );
}
