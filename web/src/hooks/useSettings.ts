import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/api/settings';

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['app-settings'],
    queryFn: getSettings,
  });

  const update = useMutation({
    mutationFn: updateSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['app-settings'] }),
  });

  return { settings: query.data, query, update };
}
