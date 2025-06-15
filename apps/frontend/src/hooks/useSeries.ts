// Hook personalizado para gestión de series con React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { seriesService, ApiError } from '../services/SeriesService';
import { 
  Series, 
  CreateSeriesData, 
  UpdateSeriesData, 
  SeriesFilters, 
  SeriesListResult,
  SeriesStats,
  UserSeriesMetrics 
} from '../types/series';

// Claves de query para React Query
export const seriesKeys = {
  all: ['series'] as const,
  lists: () => [...seriesKeys.all, 'list'] as const,
  list: (filters: SeriesFilters) => [...seriesKeys.lists(), filters] as const,
  details: () => [...seriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...seriesKeys.details(), id] as const,
  stats: (id: string) => [...seriesKeys.all, 'stats', id] as const,
  metrics: () => [...seriesKeys.all, 'metrics'] as const,
};

// Hook principal para obtener series con filtros
export function useSeries(filters: SeriesFilters = {}) {
  return useQuery({
    queryKey: seriesKeys.list(filters),
    queryFn: () => seriesService.getSeries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener una serie específica
export function useSeriesById(id: string) {
  return useQuery({
    queryKey: seriesKeys.detail(id),
    queryFn: () => seriesService.getSeriesById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para obtener estadísticas de serie
export function useSeriesStats(id: string) {
  return useQuery({
    queryKey: seriesKeys.stats(id),
    queryFn: () => seriesService.getSeriesStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos para stats
  });
}

// Hook para obtener métricas del usuario
export function useUserMetrics() {
  return useQuery({
    queryKey: seriesKeys.metrics(),
    queryFn: () => seriesService.getUserMetrics(),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para crear serie
export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeriesData) => seriesService.createSeries(data),
    onSuccess: (newSeries) => {
      // Invalidar y refetch las listas de series
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seriesKeys.metrics() });
      
      // Agregar la nueva serie al cache
      queryClient.setQueryData(seriesKeys.detail(newSeries.id), newSeries);
      
      toast.success(`Serie "${newSeries.name}" creada exitosamente`);
    },
    onError: (error: ApiError) => {
      console.error('Error creando serie:', error);
      toast.error(error.message || 'Error al crear la serie');
    },
  });
}

// Hook para actualizar serie
export function useUpdateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeriesData }) => 
      seriesService.updateSeries(id, data),
    onSuccess: (updatedSeries) => {
      // Actualizar el cache de la serie específica
      queryClient.setQueryData(seriesKeys.detail(updatedSeries.id), updatedSeries);
      
      // Invalidar listas para reflejar cambios
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seriesKeys.metrics() });
      
      toast.success(`Serie "${updatedSeries.name}" actualizada exitosamente`);
    },
    onError: (error: ApiError) => {
      console.error('Error actualizando serie:', error);
      toast.error(error.message || 'Error al actualizar la serie');
    },
  });
}

// Hook para cambiar estado de serie
export function useUpdateSeriesStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'draft' }) => 
      seriesService.updateSeriesStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: seriesKeys.detail(id) });
      
      const previousSeries = queryClient.getQueryData(seriesKeys.detail(id));
      
      if (previousSeries) {
        queryClient.setQueryData(seriesKeys.detail(id), {
          ...previousSeries,
          status,
        });
      }
      
      return { previousSeries };
    },
    onSuccess: (updatedSeries) => {
      queryClient.setQueryData(seriesKeys.detail(updatedSeries.id), updatedSeries);
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seriesKeys.metrics() });
      
      const statusLabels = {
        active: 'activada',
        paused: 'pausada',
        draft: 'marcada como borrador'
      };
      
      toast.success(`Serie "${updatedSeries.name}" ${statusLabels[updatedSeries.status]}`);
    },
    onError: (error: ApiError, { id }, context) => {
      // Revertir optimistic update
      if (context?.previousSeries) {
        queryClient.setQueryData(seriesKeys.detail(id), context.previousSeries);
      }
      
      console.error('Error cambiando estado de serie:', error);
      toast.error(error.message || 'Error al cambiar el estado de la serie');
    },
  });
}

// Hook para eliminar serie
export function useDeleteSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seriesService.deleteSeries(id),
    onSuccess: (_, deletedId) => {
      // Remover de todas las listas
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seriesKeys.metrics() });
      
      // Remover del cache específico
      queryClient.removeQueries({ queryKey: seriesKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: seriesKeys.stats(deletedId) });
      
      toast.success('Serie eliminada exitosamente');
    },
    onError: (error: ApiError) => {
      console.error('Error eliminando serie:', error);
      toast.error(error.message || 'Error al eliminar la serie');
    },
  });
}

// Hook para duplicar serie
export function useDuplicateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }: { 
      id: string; 
      options?: { name?: string; copy_videos?: boolean } 
    }) => seriesService.duplicateSeries(id, options),
    onSuccess: (duplicatedSeries) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seriesKeys.metrics() });
      queryClient.setQueryData(seriesKeys.detail(duplicatedSeries.id), duplicatedSeries);
      
      toast.success(`Serie duplicada como "${duplicatedSeries.name}"`);
    },
    onError: (error: ApiError) => {
      console.error('Error duplicando serie:', error);
      toast.error(error.message || 'Error al duplicar la serie');
    },
  });
}

// Hook para búsqueda de series
export function useSearchSeries(query: string, filters?: Partial<SeriesFilters>) {
  return useQuery({
    queryKey: [...seriesKeys.all, 'search', query, filters],
    queryFn: () => seriesService.searchSeries(query, filters),
    enabled: query.length > 0,
    staleTime: 30 * 1000, // 30 segundos para búsquedas
  });
}

// Hook compuesto para operaciones comunes
export function useSeriesOperations() {
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const updateStatus = useUpdateSeriesStatus();
  const deleteSeries = useDeleteSeries();
  const duplicateSeries = useDuplicateSeries();

  return {
    createSeries,
    updateSeries,
    updateStatus,
    deleteSeries,
    duplicateSeries,
    isLoading: createSeries.isPending || 
               updateSeries.isPending || 
               updateStatus.isPending || 
               deleteSeries.isPending || 
               duplicateSeries.isPending,
  };
} 