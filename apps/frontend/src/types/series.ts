// Tipos TypeScript para Series - Frontend
// Adaptados desde el backend para uso en React

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

// Modelo principal de Series (adaptado para frontend)
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
  
  // Timestamps (como strings para JSON)
  last_video_generated?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
  last_video_date?: string;
  performance_trend: 'up' | 'down' | 'stable';
  top_performing_videos: {
    id: string;
    title: string;
    views: number;
    engagement_rate: number;
  }[];
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

// Tipos para UI/UX
export interface SeriesFormData extends CreateSeriesData {
  // Campos adicionales para el formulario
}

// Estados de carga para UI
export interface SeriesLoadingStates {
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  changingStatus: boolean;
}

// Configuración de estado por serie
export const statusConfig = {
  active: { 
    label: 'Activa', 
    color: 'bg-green-100 text-green-800',
    icon: '🟢'
  },
  paused: { 
    label: 'Pausada', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏸️'
  },
  draft: { 
    label: 'Borrador', 
    color: 'bg-gray-100 text-gray-800',
    icon: '📝'
  }
};

// Configuración de plataformas
export const platformConfig = {
  tiktok: {
    name: 'TikTok',
    color: 'bg-black text-white',
    icon: '🎵'
  },
  instagram: {
    name: 'Instagram',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    icon: '📸'
  },
  youtube: {
    name: 'YouTube',
    color: 'bg-red-600 text-white',
    icon: '📺'
  }
};

// Configuración de estilos de contenido
export const contentStyleConfig = {
  educational: {
    name: 'Educativo',
    description: 'Contenido informativo y didáctico',
    icon: '🎓'
  },
  entertainment: {
    name: 'Entretenimiento',
    description: 'Contenido divertido y viral',
    icon: '🎭'
  },
  promotional: {
    name: 'Promocional',
    description: 'Contenido de marketing y ventas',
    icon: '📢'
  }
};

// Exportación explícita de todos los tipos principales
export type {
  SeriesStatus,
  SeriesFrequency,
  Platform,
  ContentStyle,
  VoiceSettings,
  PublishSchedule,
  Series,
  CreateSeriesData,
  UpdateSeriesData,
  SeriesFilters,
  SeriesListResult,
  SeriesStats,
  UserSeriesMetrics,
  SeriesFormData,
  SeriesLoadingStates
}; 