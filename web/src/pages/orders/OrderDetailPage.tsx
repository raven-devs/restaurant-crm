import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/auth/AuthContext';
import {
  useOrder,
  useAdvanceOrderStatus,
  useDeleteOrder,
} from '@/hooks/useOrders';
import { useOrderStatuses } from '@/hooks/useReferences';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/IconButton';
import { STATUS_COLORS, STATUS_BUTTON_COLORS } from '@/lib/status-colors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

const TERMINAL_STATUS = 'Closed';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading, error } = useOrder(id!);
  const { query: statusesQuery } = useOrderStatuses();
  const { settings } = useSettings();
  const currency = settings?.currency ?? 'UAH';
  const advanceStatus = useAdvanceOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAdvance = () => {
    if (!order) return;
    advanceStatus.mutate(
      { orderId: order.id, employeeId: user?.employee_id ?? undefined },
      {
        onSuccess: () => toast.success('Status changed'),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!order) return <p className="text-muted-foreground">Order not found</p>;

  const statusName = order.status?.name ?? '—';
  const nextStatusId = order.status?.next_status_id;
  const nextStatusName = statusesQuery.data?.find(
    (s) => s.id === nextStatusId,
  )?.name;
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
            <dt className="text-muted-foreground">Order ID</dt>
            <dd>#{order.id.slice(0, 8)}</dd>
            <dt className="text-muted-foreground">Order Date</dt>
            <dd>{new Date(order.order_date).toLocaleDateString()}</dd>
            <dt className="text-muted-foreground">Client</dt>
            <dd>{order.client?.name ?? order.client_id}</dd>
            <dt className="text-muted-foreground">Sales Channel</dt>
            <dd>{order.sales_channel?.name ?? order.sales_channel_id}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`inline-block size-2 rounded-full ${STATUS_COLORS[statusName] ?? 'bg-gray-400'}`}
                />
                {statusName}
              </span>
            </dd>
            <dt className="text-muted-foreground">Order Health</dt>
            <dd>
              <span
                title={order.color === 'red' ? 'Overdue' : 'On track'}
                className={`inline-flex items-center gap-1.5 ${order.color === 'red' ? 'text-red-600' : 'text-green-600'}`}
              >
                <span
                  className={`inline-block size-2 rounded-full ${order.color === 'red' ? 'bg-red-500' : 'bg-green-500'}`}
                />
                {order.color === 'red' ? 'Overdue' : 'On track'}
              </span>
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
                <TableHead className="w-32 text-right">Price</TableHead>
                <TableHead className="w-32 text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.length ? (
                <>
                  {order.items.map((item) => {
                    const price =
                      item.price_at_order ?? item.nomenclature_item?.price ?? 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.nomenclature_item?.name ??
                            item.nomenclature_item_id}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {price.toLocaleString('uk-UA', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {(item.quantity * price).toLocaleString('uk-UA', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="font-semibold">
                    <TableCell colSpan={3} className="text-right">
                      Total ({currency})
                    </TableCell>
                    <TableCell className="text-right">
                      {order.items
                        .reduce((sum, i) => {
                          const p =
                            i.price_at_order ?? i.nomenclature_item?.price ?? 0;
                          return sum + i.quantity * p;
                        }, 0)
                        .toLocaleString('uk-UA', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
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

      <div className="flex justify-between">
        <Button
          variant="outline"
          className="hover:bg-red-100 hover:text-red-600 hover:border-red-200"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="mr-1 size-4" />
          Delete
        </Button>
        {canAdvance && (
          <Button
            onClick={handleAdvance}
            disabled={advanceStatus.isPending}
            className={
              nextStatusName
                ? `${STATUS_BUTTON_COLORS[nextStatusName] ?? ''} text-white`
                : ''
            }
          >
            <ArrowRight className="mr-1 size-4" />
            {advanceStatus.isPending
              ? 'Moving...'
              : `Move to: ${nextStatusName ?? 'Next Status'}`}
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteOrder.mutate(order.id, {
                  onSuccess: () => {
                    toast.success('Order deleted');
                    navigate('/orders');
                  },
                  onError: (err) => toast.error(err.message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
