// Servicio para gestión de series - Integración con API Backend
import { Series, CreateSeriesData, UpdateSeriesData, SeriesFilters, SeriesListResult, SeriesStats, UserSeriesMetrics } from '../types/series';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Clase para manejar errores de API
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Servicio principal de Series
export class SeriesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Error en la solicitud';
      const errorCode = data.error?.code || 'UNKNOWN_ERROR';
      
      throw new ApiError(errorMessage, response.status, errorCode, data.error?.details);
    }

    return data.data;
  }

  // Obtener series con filtros y paginación
  async getSeries(filters: SeriesFilters = {}): Promise<SeriesListResult> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.platforms?.length) params.append('platforms', filters.platforms.join(','));
    if (filters.content_style) params.append('content_style', filters.content_style);

    const response = await fetch(`${API_BASE_URL}/series?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<SeriesListResult>(response);
  }

  // Crear nueva serie
  async createSeries(data: CreateSeriesData): Promise<Series> {
    const response = await fetch(`${API_BASE_URL}/series`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Series>(response);
  }

  // Obtener serie por ID
  async getSeriesById(id: string): Promise<Series> {
    const response = await fetch(`${API_BASE_URL}/series/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Series>(response);
  }

  // Actualizar serie completa
  async updateSeries(id: string, data: UpdateSeriesData): Promise<Series> {
    const response = await fetch(`${API_BASE_URL}/series/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Series>(response);
  }

  // Cambiar estado de serie
  async updateSeriesStatus(id: string, status: 'active' | 'paused' | 'draft'): Promise<Series> {
    const response = await fetch(`${API_BASE_URL}/series/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse<Series>(response);
  }

  // Eliminar serie
  async deleteSeries(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/series/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse<void>(response);
  }

  // Duplicar serie
  async duplicateSeries(id: string, options?: { name?: string; copy_videos?: boolean }): Promise<Series> {
    const response = await fetch(`${API_BASE_URL}/series/${id}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(options || {}),
    });

    return this.handleResponse<Series>(response);
  }

  // Obtener estadísticas de serie
  async getSeriesStats(id: string): Promise<SeriesStats> {
    const response = await fetch(`${API_BASE_URL}/series/${id}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<SeriesStats>(response);
  }

  // Búsqueda avanzada
  async searchSeries(query: string, filters?: Partial<SeriesFilters>): Promise<SeriesListResult> {
    const params = new URLSearchParams({ search: query });
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platforms?.length) params.append('platforms', filters.platforms.join(','));
    if (filters?.content_style) params.append('content_style', filters.content_style);

    const response = await fetch(`${API_BASE_URL}/series/search?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<SeriesListResult>(response);
  }

  // Obtener métricas del usuario
  async getUserMetrics(): Promise<UserSeriesMetrics> {
    const response = await fetch(`${API_BASE_URL}/series/metrics`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<UserSeriesMetrics>(response);
  }
}

// Instancia singleton del servicio
export const seriesService = new SeriesService(); 