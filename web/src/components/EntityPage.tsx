import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/IconButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { DataTable, type Column } from '@/components/DataTable';

export interface FieldDef {
  name: string;
  label: string;
  description?: string;
  editDescription?: string;
  type?: 'text' | 'number' | 'tel' | 'email' | 'select' | 'password';
  options?: { value: string; label: string }[];
  required?: boolean;
  requiredOnCreate?: boolean;
}

interface EntityPageProps<T extends { id: string }> {
  title: string;
  query: UseQueryResult<T[]>;
  columns: Column<T>[];
  fields: FieldDef[];
  searchField?: keyof T;
  createMutation?: UseMutationResult<T, Error, unknown>;
  updateMutation?: UseMutationResult<T, Error, { id: string; data: unknown }>;
  deleteMutation?: UseMutationResult<unknown, Error, string>;
  readOnly?: boolean;
  exportFilename?: string;
  createLabel?: string;
}

export function EntityPage<T extends { id: string }>({
  title,
  query,
  columns,
  fields,
  searchField,
  createMutation,
  updateMutation,
  deleteMutation,
  readOnly = false,
  exportFilename,
  createLabel = 'Create',
}: EntityPageProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: T) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const filteredData = useMemo(() => {
    if (!searchField || search.length < 3 || !query.data) return query.data;
    const q = search.toLowerCase();
    return query.data.filter((item) =>
      String(item[searchField] ?? '')
        .toLowerCase()
        .includes(q),
    );
  }, [query.data, search, searchField]);

  const confirmDelete = () => {
    if (!deleteMutation || !deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Deleted');
        setDeleteId(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          {searchField && (
            <Input
              placeholder="Search by name..."
              className="w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {exportFilename && filteredData && filteredData.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(columns, filteredData, exportFilename)}
            >
              <Download className="mr-1.5 size-4" />
              Export
            </Button>
          )}
          {!readOnly && createMutation && (
            <Button onClick={openCreate} size="sm">
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {query.isLoading && <p className="text-muted-foreground">Loading...</p>}
      {query.error && <p className="text-destructive">{query.error.message}</p>}
      {filteredData && (
        <DataTable
          columns={columns}
          data={filteredData}
          actions={
            readOnly
              ? undefined
              : (row) => (
                  <div className="flex gap-1">
                    {updateMutation && (
                      <IconButton
                        tooltip="Edit"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil />
                      </IconButton>
                    )}
                    {deleteMutation && (
                      <IconButton
                        tooltip="Delete"
                        variant="ghost"
                        size="icon-sm"
                        className="hover:bg-red-100 hover:text-red-600"
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 />
                      </IconButton>
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
          createLabel={createLabel}
        />
      )}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  createLabel = 'Create',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FieldDef[];
  editingItem: T | null;
  createMutation?: UseMutationResult<T, Error, unknown>;
  updateMutation?: UseMutationResult<T, Error, { id: string; data: unknown }>;
  createLabel?: string;
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
          <DialogTitle>{isEditing ? 'Edit' : createLabel}</DialogTitle>
        </DialogHeader>
        <EntityForm
          fields={fields}
          defaults={defaults}
          isEditing={isEditing}
          onCancel={() => onOpenChange(false)}
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
  isEditing,
  onSubmit,
  onCancel,
  isPending,
}: {
  fields: FieldDef[];
  defaults: Record<string, string>;
  isEditing: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ defaultValues: defaults });

  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set(),
  );

  const togglePasswordVisibility = (name: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isFieldRequired = (f: FieldDef) => {
    if (f.requiredOnCreate) return !isEditing;
    return f.required !== false;
  };

  const processSubmit = (data: Record<string, string>) => {
    const processed: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.type === 'number') {
        const val = data[f.name];
        processed[f.name] =
          val === '' || val === undefined ? null : Number(val);
      } else if (f.type === 'password' && isEditing && !data[f.name]) {
        continue;
      } else {
        processed[f.name] = data[f.name];
      }
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
          {(isEditing
            ? (f.editDescription ?? f.description)
            : f.description) && (
            <p className="text-xs text-muted-foreground">
              {isEditing ? (f.editDescription ?? f.description) : f.description}
            </p>
          )}
          {f.type === 'select' ? (
            <Controller
              name={f.name}
              control={control}
              rules={{ required: isFieldRequired(f) }}
              render={({ field: { onChange, value } }) => {
                const selected = f.options?.find((o) => o.value === value);
                return (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors[f.name]}
                    >
                      <SelectValue
                        placeholder={`Select ${f.label.toLowerCase()}`}
                      >
                        {selected?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          ) : f.type === 'password' ? (
            <div className="relative">
              <Input
                id={f.name}
                type={visiblePasswords.has(f.name) ? 'text' : 'password'}
                aria-invalid={!!errors[f.name]}
                {...register(f.name, { required: isFieldRequired(f) })}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => togglePasswordVisibility(f.name)}
                tabIndex={-1}
              >
                {visiblePasswords.has(f.name) ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          ) : (
            <Input
              id={f.name}
              type={f.type === 'number' ? 'number' : (f.type ?? 'text')}
              step={f.type === 'number' ? 'any' : undefined}
              aria-invalid={!!errors[f.name]}
              {...register(f.name, { required: isFieldRequired(f) })}
            />
          )}
          {errors[f.name] && (
            <p className="text-xs text-destructive">{f.label} is required</p>
          )}
        </div>
      ))}
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );
}
