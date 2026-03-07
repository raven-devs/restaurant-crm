import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DataTable, type Column } from '@/components/DataTable';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'tel' | 'email';
  required?: boolean;
}

interface EntityPageProps<T extends { id: string }> {
  title: string;
  query: UseQueryResult<T[]>;
  columns: Column<T>[];
  fields: FieldDef[];
  createMutation?: UseMutationResult<T, Error, unknown>;
  updateMutation?: UseMutationResult<T, Error, { id: string; data: unknown }>;
  deleteMutation?: UseMutationResult<unknown, Error, string>;
  readOnly?: boolean;
}

export function EntityPage<T extends { id: string }>({
  title,
  query,
  columns,
  fields,
  createMutation,
  updateMutation,
  deleteMutation,
  readOnly = false,
}: EntityPageProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: T) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!deleteMutation) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Deleted'),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        {!readOnly && createMutation && (
          <Button onClick={openCreate} size="sm">
            Create
          </Button>
        )}
      </div>

      {query.isLoading && <p className="text-muted-foreground">Loading...</p>}
      {query.error && <p className="text-destructive">{query.error.message}</p>}
      {query.data && (
        <DataTable
          columns={columns}
          data={query.data}
          actions={
            readOnly
              ? undefined
              : (row) => (
                  <div className="flex gap-1">
                    {updateMutation && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil />
                      </Button>
                    )}
                    {deleteMutation && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                )
          }
        />
      )}

      {!readOnly && (
        <EntityDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          fields={fields}
          editingItem={editingItem}
          createMutation={createMutation}
          updateMutation={updateMutation}
        />
      )}
    </div>
  );
}

function EntityDialog<T extends { id: string }>({
  open,
  onOpenChange,
  fields,
  editingItem,
  createMutation,
  updateMutation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FieldDef[];
  editingItem: T | null;
  createMutation?: UseMutationResult<T, Error, unknown>;
  updateMutation?: UseMutationResult<T, Error, { id: string; data: unknown }>;
}) {
  const isEditing = editingItem !== null;
  const defaults: Record<string, string> = {};
  for (const f of fields) {
    defaults[f.name] = isEditing
      ? String((editingItem as Record<string, unknown>)[f.name] ?? '')
      : '';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'}</DialogTitle>
        </DialogHeader>
        <EntityForm
          fields={fields}
          defaults={defaults}
          onSubmit={(data) => {
            if (isEditing && updateMutation) {
              updateMutation.mutate(
                { id: editingItem.id, data },
                {
                  onSuccess: () => {
                    toast.success('Updated');
                    onOpenChange(false);
                  },
                  onError: (err) => toast.error(err.message),
                },
              );
            } else if (createMutation) {
              createMutation.mutate(data, {
                onSuccess: () => {
                  toast.success('Created');
                  onOpenChange(false);
                },
                onError: (err) => toast.error(err.message),
              });
            }
          }}
          isPending={
            (isEditing
              ? updateMutation?.isPending
              : createMutation?.isPending) ?? false
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function EntityForm({
  fields,
  defaults,
  onSubmit,
  isPending,
}: {
  fields: FieldDef[];
  defaults: Record<string, string>;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm({ defaultValues: defaults });

  const processSubmit = (data: Record<string, string>) => {
    const processed: Record<string, unknown> = {};
    for (const f of fields) {
      processed[f.name] =
        f.type === 'number' ? Number(data[f.name]) : data[f.name];
    }
    onSubmit(processed);
  };

  return (
    <form
      onSubmit={handleSubmit(processSubmit)}
      className="flex flex-col gap-3"
    >
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col gap-1.5">
          <Label htmlFor={f.name}>{f.label}</Label>
          <Input
            id={f.name}
            type={f.type === 'number' ? 'number' : (f.type ?? 'text')}
            step={f.type === 'number' ? 'any' : undefined}
            {...register(f.name, { required: f.required !== false })}
          />
        </div>
      ))}
      <DialogFooter>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );
}
