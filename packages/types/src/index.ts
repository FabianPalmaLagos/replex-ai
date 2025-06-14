// ==============================================
// TIPOS BÁSICOS DEL SISTEMA
// ==============================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  role: UserRole;
  preferences: UserPreferences;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  PREMIUM = 'premium',
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
}

// ==============================================
// TIPOS DE CONTENIDO
// ==============================================

export interface VideoSeries extends BaseEntity {
  name: string;
  description?: string;
  userId: string;
  settings: SeriesSettings;
  isActive: boolean;
  tags: string[];
}

export interface SeriesSettings {
  theme: string;
  duration: VideoDuration;
  style: VideoStyle;
  frequency: PublishFrequency;
  platforms: SocialPlatform[];
  voiceSettings: VoiceSettings;
}

export enum VideoDuration {
  SHORT = 'short', // 15-30s
  MEDIUM = 'medium', // 30-60s
  LONG = 'long', // 60-90s
}

export enum VideoStyle {
  MINIMAL = 'minimal',
  DYNAMIC = 'dynamic',
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
}

export enum PublishFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum SocialPlatform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
}

export interface VoiceSettings {
  provider: VoiceProvider;
  voiceId: string;
  speed: number;
  pitch: number;
  volume: number;
}

export enum VoiceProvider {
  ELEVENLABS = 'elevenlabs',
  GOOGLE = 'google',
  AZURE = 'azure',
}

// ==============================================
// TIPOS DE GENERACIÓN DE CONTENIDO
// ==============================================

export interface ContentPrompt extends BaseEntity {
  seriesId: string;
  title: string;
  content: string;
  variables: Record<string, any>;
  version: number;
}

export interface GeneratedContent extends BaseEntity {
  promptId: string;
  seriesId: string;
  userId: string;
  status: ContentStatus;
  assets: ContentAssets;
  metadata: ContentMetadata;
}

export enum ContentStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  READY = 'ready',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

export interface ContentAssets {
  script: string;
  images: string[];
  audio: string;
  video?: string;
  thumbnail?: string;
}

export interface ContentMetadata {
  title: string;
  description: string;
  hashtags: string[];
  duration: number;
  dimensions: VideoDimensions;
  fileSize?: number;
}

export interface VideoDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

// ==============================================
// TIPOS DE API
// ==============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// ==============================================
// TIPOS DE CONFIGURACIÓN
// ==============================================

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiVersion: string;
  corsOrigin: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
}

// ==============================================
// EXPORTACIONES
// ==============================================

export * from './auth';
export * from './content';
export * from './analytics'; 