import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrder, useAdvanceOrderStatus } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/IconButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const TERMINAL_STATUS = 'Closed';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id!);
  const advanceStatus = useAdvanceOrderStatus();

  const handleAdvance = () => {
    if (!order) return;
    advanceStatus.mutate(
      { orderId: order.id },
      {
        onSuccess: () => toast.success('Status advanced'),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!order) return <p className="text-muted-foreground">Order not found</p>;

  const statusName = order.status?.name ?? '—';
  const canAdvance = statusName !== TERMINAL_STATUS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <IconButton tooltip="Back" variant="ghost" size="icon-sm" asChild>
          <Link to="/orders">
            <ArrowLeft />
          </Link>
        </IconButton>
        <h1 className="text-lg font-semibold">Order Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Date</dt>
            <dd>{new Date(order.order_date).toLocaleDateString()}</dd>
            <dt className="text-muted-foreground">Client</dt>
            <dd>{order.client?.name ?? order.client_id}</dd>
            <dt className="text-muted-foreground">Sales Channel</dt>
            <dd>{order.sales_channel?.name ?? order.sales_channel_id}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <Badge variant="outline">{statusName}</Badge>
            </dd>
            <dt className="text-muted-foreground">Accepted By</dt>
            <dd>{order.accepted_by?.name ?? '—'}</dd>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{new Date(order.created_at).toLocaleString()}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-24">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.length ? (
                order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.nomenclature_item?.name ??
                        item.nomenclature_item_id}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    No items
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      {canAdvance && (
        <div className="flex justify-end">
          <Button onClick={handleAdvance} disabled={advanceStatus.isPending}>
            <ArrowRight className="mr-1 size-4" />
            {advanceStatus.isPending
              ? 'Advancing...'
              : `Advance to Next Status`}
          </Button>
        </div>
      )}
    </div>
  );
}
