// ==============================================
// TIPOS DE ANALYTICS Y MÉTRICAS
// ==============================================

export interface AnalyticsData {
  id: string;
  contentId: string;
  platform: SocialPlatform;
  metrics: PlatformMetrics;
  demographics: Demographics;
  engagement: EngagementMetrics;
  performance: PerformanceMetrics;
  collectedAt: Date;
  updatedAt: Date;
}

export interface PlatformMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  saves?: number; // Instagram/TikTok
  downloads?: number;
  clickThroughRate?: number;
  impressions?: number;
  reach?: number;
}

export interface Demographics {
  ageGroups: AgeGroup[];
  genderDistribution: GenderDistribution;
  topCountries: CountryData[];
  topCities: CityData[];
  deviceTypes: DeviceTypeData[];
}

export interface AgeGroup {
  range: string;
  percentage: number;
  count: number;
}

export interface GenderDistribution {
  male: number;
  female: number;
  other: number;
  unknown: number;
}

export interface CountryData {
  country: string;
  countryCode: string;
  percentage: number;
  count: number;
}

export interface CityData {
  city: string;
  country: string;
  percentage: number;
  count: number;
}

export interface DeviceTypeData {
  type: DeviceType;
  percentage: number;
  count: number;
}

export interface EngagementMetrics {
  engagementRate: number;
  averageWatchTime: number;
  completionRate: number;
  dropOffPoints: DropOffPoint[];
  peakViewingTime: number;
  interactionsByType: InteractionData[];
}

export interface DropOffPoint {
  timestamp: number;
  percentage: number;
  viewersRemaining: number;
}

export interface InteractionData {
  type: InteractionType;
  count: number;
  timestamp: number;
}

export enum InteractionType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  SAVE = 'save',
  CLICK = 'click',
  FOLLOW = 'follow',
  DUET = 'duet',
  STITCH = 'stitch',
}

export interface PerformanceMetrics {
  viralityScore: number;
  trendingPotential: number;
  qualityScore: number;
  audienceRetention: number;
  growthRate: number;
  competitorComparison: CompetitorData[];
}

export interface CompetitorData {
  metric: string;
  ourValue: number;
  competitorAverage: number;
  percentageDifference: number;
}

// ==============================================
// TIPOS DE REPORTES
// ==============================================

export interface AnalyticsReport {
  id: string;
  userId: string;
  type: ReportType;
  period: ReportPeriod;
  filters: ReportFilters;
  data: ReportData;
  insights: Insight[];
  recommendations: Recommendation[];
  generatedAt: Date;
  expiresAt: Date;
}

export enum ReportType {
  OVERVIEW = 'overview',
  CONTENT_PERFORMANCE = 'content_performance',
  AUDIENCE_INSIGHTS = 'audience_insights',
  PLATFORM_COMPARISON = 'platform_comparison',
  TREND_ANALYSIS = 'trend_analysis',
  ROI_ANALYSIS = 'roi_analysis',
}

export interface ReportPeriod {
  start: Date;
  end: Date;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export interface ReportFilters {
  platforms?: SocialPlatform[];
  contentTypes?: string[];
  series?: string[];
  dateRange?: DateRange;
  metrics?: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportData {
  summary: SummaryMetrics;
  timeSeries: TimeSeriesData[];
  topContent: TopContentData[];
  platformBreakdown: PlatformBreakdownData[];
  trends: TrendData[];
}

export interface SummaryMetrics {
  totalViews: number;
  totalEngagement: number;
  averageEngagementRate: number;
  totalFollowersGained: number;
  contentPublished: number;
  topPerformingPlatform: SocialPlatform;
}

export interface TimeSeriesData {
  timestamp: Date;
  metrics: Record<string, number>;
}

export interface TopContentData {
  contentId: string;
  title: string;
  platform: SocialPlatform;
  metrics: PlatformMetrics;
  publishedAt: Date;
}

export interface PlatformBreakdownData {
  platform: SocialPlatform;
  metrics: PlatformMetrics;
  growth: GrowthData;
  audience: AudienceData;
}

export interface GrowthData {
  viewsGrowth: number;
  engagementGrowth: number;
  followersGrowth: number;
  period: string;
}

export interface AudienceData {
  totalFollowers: number;
  activeFollowers: number;
  newFollowers: number;
  unfollowers: number;
}

export interface TrendData {
  metric: string;
  trend: TrendDirection;
  changePercentage: number;
  significance: TrendSignificance;
  description: string;
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

export enum TrendSignificance {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// ==============================================
// TIPOS DE INSIGHTS Y RECOMENDACIONES
// ==============================================

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: ImpactLevel;
  confidence: number;
  data: Record<string, any>;
  actionable: boolean;
  createdAt: Date;
}

export enum InsightType {
  PERFORMANCE = 'performance',
  AUDIENCE = 'audience',
  CONTENT = 'content',
  TIMING = 'timing',
  PLATFORM = 'platform',
  TREND = 'trend',
}

export enum ImpactLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  effort: EffortLevel;
  expectedImpact: string;
  steps: RecommendationStep[];
  relatedInsights: string[];
  createdAt: Date;
}

export enum RecommendationType {
  CONTENT_OPTIMIZATION = 'content_optimization',
  POSTING_SCHEDULE = 'posting_schedule',
  AUDIENCE_TARGETING = 'audience_targeting',
  PLATFORM_STRATEGY = 'platform_strategy',
  ENGAGEMENT_BOOST = 'engagement_boost',
  GROWTH_STRATEGY = 'growth_strategy',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum EffortLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface RecommendationStep {
  order: number;
  title: string;
  description: string;
  estimated_time: string;
  resources?: string[];
}

// ==============================================
// TIPOS DE ALERTAS
// ==============================================

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  isResolved: boolean;
  triggeredAt: Date;
  resolvedAt?: Date;
}

export enum AlertType {
  PERFORMANCE_DROP = 'performance_drop',
  VIRAL_CONTENT = 'viral_content',
  ENGAGEMENT_SPIKE = 'engagement_spike',
  FOLLOWER_MILESTONE = 'follower_milestone',
  NEGATIVE_SENTIMENT = 'negative_sentiment',
  PLATFORM_ISSUE = 'platform_issue',
  QUOTA_LIMIT = 'quota_limit',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
} 