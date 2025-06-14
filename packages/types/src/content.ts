// ==============================================
// TIPOS DE PLANTILLAS Y PROMPTS
// ==============================================

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  category: PromptCategory;
  content: string;
  variables: PromptVariable[];
  isPublic: boolean;
  userId: string;
  usageCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PromptCategory {
  EDUCATIONAL = 'educational',
  ENTERTAINMENT = 'entertainment',
  MARKETING = 'marketing',
  NEWS = 'news',
  LIFESTYLE = 'lifestyle',
  TECHNOLOGY = 'technology',
  BUSINESS = 'business',
  CUSTOM = 'custom',
}

export interface PromptVariable {
  name: string;
  type: VariableType;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export enum VariableType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  DATE = 'date',
  URL = 'url',
}

// ==============================================
// TIPOS DE GENERACIÓN DE IA
// ==============================================

export interface AIGenerationRequest {
  promptId: string;
  seriesId: string;
  variables: Record<string, any>;
  options: GenerationOptions;
}

export interface GenerationOptions {
  textModel: AIModel;
  imageModel: AIModel;
  voiceModel: VoiceModel;
  style: GenerationStyle;
  quality: QualityLevel;
}

export interface AIModel {
  provider: AIProvider;
  model: string;
  version?: string;
  parameters: Record<string, any>;
}

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  STABILITY = 'stability',
  MIDJOURNEY = 'midjourney',
  ELEVENLABS = 'elevenlabs',
  GOOGLE = 'google',
}

export interface VoiceModel {
  provider: VoiceProvider;
  voiceId: string;
  language: string;
  gender: VoiceGender;
  age: VoiceAge;
  accent?: string;
}

export enum VoiceGender {
  MALE = 'male',
  FEMALE = 'female',
  NEUTRAL = 'neutral',
}

export enum VoiceAge {
  YOUNG = 'young',
  MIDDLE = 'middle',
  OLD = 'old',
}

export interface GenerationStyle {
  visualStyle: VisualStyle;
  musicStyle: MusicStyle;
  pacing: PacingStyle;
  tone: ToneStyle;
}

export enum VisualStyle {
  MINIMALIST = 'minimalist',
  VIBRANT = 'vibrant',
  PROFESSIONAL = 'professional',
  ARTISTIC = 'artistic',
  RETRO = 'retro',
  MODERN = 'modern',
}

export enum MusicStyle {
  NONE = 'none',
  AMBIENT = 'ambient',
  UPBEAT = 'upbeat',
  DRAMATIC = 'dramatic',
  CORPORATE = 'corporate',
  CINEMATIC = 'cinematic',
}

export enum PacingStyle {
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast',
  DYNAMIC = 'dynamic',
}

export enum ToneStyle {
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  FRIENDLY = 'friendly',
  AUTHORITATIVE = 'authoritative',
  HUMOROUS = 'humorous',
  DRAMATIC = 'dramatic',
}

export enum QualityLevel {
  DRAFT = 'draft',
  STANDARD = 'standard',
  HIGH = 'high',
  PREMIUM = 'premium',
}

// ==============================================
// TIPOS DE PROCESAMIENTO DE VIDEO
// ==============================================

export interface VideoProject {
  id: string;
  name: string;
  contentId: string;
  timeline: TimelineTrack[];
  settings: VideoSettings;
  status: ProjectStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  name: string;
  items: TimelineItem[];
  isVisible: boolean;
  isMuted: boolean;
  volume: number;
}

export enum TrackType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  IMAGE = 'image',
  EFFECT = 'effect',
}

export interface TimelineItem {
  id: string;
  type: TrackType;
  startTime: number;
  duration: number;
  source: string;
  properties: Record<string, any>;
  effects: Effect[];
}

export interface Effect {
  id: string;
  type: EffectType;
  name: string;
  parameters: Record<string, any>;
  startTime: number;
  duration: number;
}

export enum EffectType {
  TRANSITION = 'transition',
  FILTER = 'filter',
  TEXT_ANIMATION = 'text_animation',
  ZOOM = 'zoom',
  PAN = 'pan',
  FADE = 'fade',
  BLUR = 'blur',
  COLOR_CORRECTION = 'color_correction',
}

export interface VideoSettings {
  resolution: VideoResolution;
  frameRate: number;
  bitrate: number;
  format: VideoFormat;
  codec: VideoCodec;
  quality: QualityLevel;
}

export enum VideoResolution {
  HD_720 = '720p',
  FHD_1080 = '1080p',
  UHD_4K = '4k',
  VERTICAL_9_16 = '9:16',
  SQUARE_1_1 = '1:1',
}

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  MOV = 'mov',
  AVI = 'avi',
}

export enum VideoCodec {
  H264 = 'h264',
  H265 = 'h265',
  VP9 = 'vp9',
  AV1 = 'av1',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// ==============================================
// TIPOS DE PUBLICACIÓN
// ==============================================

export interface PublishingSchedule {
  id: string;
  contentId: string;
  platforms: PlatformConfig[];
  scheduledAt: Date;
  status: ScheduleStatus;
  attempts: PublishAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformConfig {
  platform: SocialPlatform;
  accountId: string;
  settings: PlatformSettings;
  customizations: PlatformCustomization;
}

export interface PlatformSettings {
  autoPublish: boolean;
  optimalTiming: boolean;
  hashtagStrategy: HashtagStrategy;
  captionTemplate?: string;
}

export enum HashtagStrategy {
  NONE = 'none',
  TRENDING = 'trending',
  NICHE = 'niche',
  MIXED = 'mixed',
  CUSTOM = 'custom',
}

export interface PlatformCustomization {
  title?: string;
  description?: string;
  hashtags?: string[];
  thumbnail?: string;
  privacy: PrivacyLevel;
  allowComments: boolean;
  allowDuet?: boolean; // TikTok specific
  allowStitch?: boolean; // TikTok specific
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private',
  FRIENDS = 'friends',
}

export interface PublishAttempt {
  id: string;
  platform: SocialPlatform;
  attemptedAt: Date;
  status: PublishStatus;
  response?: any;
  error?: string;
  postId?: string;
  postUrl?: string;
}

export enum PublishStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRY = 'retry',
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  PUBLISHING = 'publishing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
} 