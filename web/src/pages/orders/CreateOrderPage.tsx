import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useOrders';
import {
  useClients,
  useNomenclature,
  useSalesChannels,
} from '@/hooks/useReferences';
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
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { query: clientsQuery } = useClients();
  const { query: nomenclatureQuery } = useNomenclature();
  const { query: channelsQuery } = useSalesChannels();

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
      toast.error('Please fill in all fields and add at least one item');
      return;
    }
    createOrder.mutate(
      { client_id: clientId, sales_channel_id: channelId, items },
      {
        onSuccess: (order) => {
          toast.success('Order created');
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
      <h1 className="mb-4 text-lg font-semibold">New Order</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select client">
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
          <Label>Sales Channel</Label>
          <Select value={channelId} onValueChange={setChannelId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select channel">
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
            <CardTitle>Items</CardTitle>
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
                    x{item.quantity}
                  </span>
                  <IconButton
                    tooltip="Remove"
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              );
            })}

            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>Product</Label>
                <Select value={newItemId} onValueChange={setNewItemId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select product">
                      {selectedNewItem
                        ? `${selectedNewItem.name} — ${selectedNewItem.price} UAH`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {nomenclatureQuery.data?.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name} — {n.price} UAH
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-20 flex-col gap-1.5">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                />
              </div>
              <IconButton
                tooltip="Add item"
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
            Cancel
          </Button>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
