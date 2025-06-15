// Modelo de Series para Replex AI
// Interfaces TypeScript para la gestión de series de videos

export type SeriesStatus = 'active' | 'paused' | 'draft';
export type SeriesFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type Platform = 'tiktok' | 'instagram' | 'youtube';
export type ContentStyle = 'educational' | 'entertainment' | 'promotional';

// Configuración de voz para síntesis
export interface VoiceSettings {
  voice_id?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // -20 - 20
  stability?: number; // 0.0 - 1.0
  similarity_boost?: number; // 0.0 - 1.0
}

// Horarios de publicación por plataforma
export interface PublishSchedule {
  [platform: string]: {
    days: string[]; // ['monday', 'wednesday', 'friday']
    times: string[]; // ['09:00', '15:00', '21:00']
    timezone: string; // 'America/Santiago'
  };
}

// Modelo principal de Series
export interface Series {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: SeriesStatus;
  
  // Configuración de generación
  frequency?: SeriesFrequency;
  platforms: Platform[];
  target_audience?: string;
  content_style?: ContentStyle;
  voice_settings: VoiceSettings;
  
  // Métricas calculadas
  video_count: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  engagement_rate: number;
  
  // Configuración avanzada
  auto_publish: boolean;
  publish_schedule: PublishSchedule;
  hashtags: string[];
  
  // Timestamps
  last_video_generated?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Datos para crear una nueva serie
export interface CreateSeriesData {
  name: string;
  description?: string;
  frequency?: SeriesFrequency;
  platforms?: Platform[];
  target_audience?: string;
  content_style?: ContentStyle;
  voice_settings?: VoiceSettings;
  auto_publish?: boolean;
  publish_schedule?: PublishSchedule;
  hashtags?: string[];
}

// Datos para actualizar una serie
export interface UpdateSeriesData extends Partial<CreateSeriesData> {
  status?: SeriesStatus;
}

// Filtros para búsqueda de series
export interface SeriesFilters {
  page?: number;
  limit?: number;
  status?: SeriesStatus;
  search?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'video_count';
  sortOrder?: 'asc' | 'desc';
  platforms?: Platform[];
  content_style?: ContentStyle;
}

// Resultado paginado de series
export interface SeriesListResult {
  series: Series[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SeriesFilters;
}

// Estadísticas de una serie
export interface SeriesStats {
  series_id: string;
  video_count: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  engagement_rate: number;
  avg_views_per_video: number;
  last_video_date?: Date;
  performance_trend: 'up' | 'down' | 'stable';
  top_performing_videos: {
    id: string;
    title: string;
    views: number;
    engagement_rate: number;
  }[];
}

// Plantilla de serie
export interface SeriesTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'education' | 'business' | 'entertainment';
  default_settings: CreateSeriesData;
  is_public: boolean;
  created_by?: string;
  usage_count: number;
  created_at: Date;
}

// Historial de cambios en series
export interface SeriesHistory {
  id: string;
  series_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'deleted';
  old_values?: Partial<Series>;
  new_values?: Partial<Series>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// Respuesta estándar de la API
export interface SeriesApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

// Métricas agregadas del usuario
export interface UserSeriesMetrics {
  total_series: number;
  active_series: number;
  paused_series: number;
  draft_series: number;
  total_videos: number;
  total_views: number;
  total_engagement: number;
  avg_engagement_rate: number;
  most_popular_platform: Platform;
  most_used_content_style: ContentStyle;
} 