// Servicio de Series - Lógica de negocio para gestión de series
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import {
  Series,
  CreateSeriesData,
  UpdateSeriesData,
  SeriesFilters,
  SeriesListResult,
  SeriesStats,
  SeriesTemplate,
  SeriesHistory,
  UserSeriesMetrics
} from '../models/Series';

export class SeriesService {
  
  // Crear nueva serie
  async createSeries(userId: string, data: CreateSeriesData): Promise<Series> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insertar serie
      const insertQuery = `
        INSERT INTO series (
          user_id, name, description, frequency, platforms, target_audience,
          content_style, voice_settings, auto_publish, publish_schedule, hashtags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        userId,
        data.name,
        data.description || null,
        data.frequency || null,
        data.platforms || [],
        data.target_audience || null,
        data.content_style || null,
        JSON.stringify(data.voice_settings || {}),
        data.auto_publish || false,
        JSON.stringify(data.publish_schedule || {}),
        data.hashtags || []
      ];
      
      const result = await client.query(insertQuery, values);
      const series = this.mapDatabaseToSeries(result.rows[0]);
      
      // Registrar en auditoría
      await this.logSeriesHistory(client, {
        series_id: series.id,
        user_id: userId,
        action: 'created',
        new_values: series
      });
      
      await client.query('COMMIT');
      
      logger.info('Serie creada exitosamente', {
        seriesId: series.id,
        userId,
        name: series.name
      });
      
      return series;
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creando serie:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Obtener series del usuario con filtros
  async getUserSeries(userId: string, filters: SeriesFilters): Promise<SeriesListResult> {
    try {
      const { query, countQuery, params } = this.buildSeriesQuery(userId, filters);
      
      // Ejecutar consultas en paralelo
      const [seriesResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, params.slice(0, -2)) // Remover LIMIT y OFFSET para count
      ]);
      
      const series = seriesResult.rows.map(row => this.mapDatabaseToSeries(row));
      const total = parseInt(countResult.rows[0].count);
      
      const pagination = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total,
        totalPages: Math.ceil(total / (filters.limit || 10))
      };
      
      return {
        series,
        pagination,
        filters
      };
      
    } catch (error) {
      logger.error('Error obteniendo series del usuario:', error);
      throw error;
    }
  }
  
  // Obtener serie por ID
  async getSeriesById(seriesId: string, userId: string): Promise<Series | null> {
    try {
      const query = `
        SELECT s.*
        FROM series s
        WHERE s.id = $1 AND s.user_id = $2 AND s.deleted_at IS NULL
      `;
      
      const result = await pool.query(query, [seriesId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDatabaseToSeries(result.rows[0]);
      
    } catch (error) {
      logger.error('Error obteniendo serie por ID:', error);
      throw error;
    }
  }
  
  // Actualizar serie
  async updateSeries(seriesId: string, userId: string, data: UpdateSeriesData): Promise<Series> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Obtener serie actual para auditoría
      const currentSeries = await this.getSeriesById(seriesId, userId);
      if (!currentSeries) {
        throw { code: 'SERIES_NOT_FOUND', message: 'Serie no encontrada' };
      }
      
      // Construir query de actualización dinámicamente
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'voice_settings' || key === 'publish_schedule') {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(value);
          }
          paramIndex++;
        }
      });
      
      if (updateFields.length === 0) {
        await client.query('COMMIT');
        return currentSeries;
      }
      
      // Agregar parámetros de WHERE
      values.push(seriesId, userId);
      
      const updateQuery = `
        UPDATE series 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} AND deleted_at IS NULL
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        throw { code: 'SERIES_NOT_FOUND', message: 'Serie no encontrada' };
      }
      
      const updatedSeries = this.mapDatabaseToSeries(result.rows[0]);
      
      // Registrar en auditoría
      await this.logSeriesHistory(client, {
        series_id: seriesId,
        user_id: userId,
        action: 'updated',
        old_values: currentSeries,
        new_values: updatedSeries
      });
      
      await client.query('COMMIT');
      
      logger.info('Serie actualizada exitosamente', {
        seriesId,
        userId,
        changes: Object.keys(data)
      });
      
      return updatedSeries;
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error actualizando serie:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Cambiar estado de serie
  async updateSeriesStatus(seriesId: string, userId: string, status: string): Promise<Series> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const currentSeries = await this.getSeriesById(seriesId, userId);
      if (!currentSeries) {
        throw { code: 'SERIES_NOT_FOUND', message: 'Serie no encontrada' };
      }
      
      const updateQuery = `
        UPDATE series 
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [status, seriesId, userId]);
      const updatedSeries = this.mapDatabaseToSeries(result.rows[0]);
      
      // Registrar en auditoría
      await this.logSeriesHistory(client, {
        series_id: seriesId,
        user_id: userId,
        action: 'status_changed',
        old_values: { status: currentSeries.status },
        new_values: { status }
      });
      
      await client.query('COMMIT');
      
      logger.info('Estado de serie actualizado', {
        seriesId,
        userId,
        oldStatus: currentSeries.status,
        newStatus: status
      });
      
      return updatedSeries;
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error actualizando estado de serie:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Eliminar serie (soft delete)
  async deleteSeries(seriesId: string, userId: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const currentSeries = await this.getSeriesById(seriesId, userId);
      if (!currentSeries) {
        throw { code: 'SERIES_NOT_FOUND', message: 'Serie no encontrada' };
      }
      
      const deleteQuery = `
        UPDATE series 
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      `;
      
      await client.query(deleteQuery, [seriesId, userId]);
      
      // Registrar en auditoría
      await this.logSeriesHistory(client, {
        series_id: seriesId,
        user_id: userId,
        action: 'deleted',
        old_values: currentSeries
      });
      
      await client.query('COMMIT');
      
      logger.info('Serie eliminada exitosamente', {
        seriesId,
        userId,
        name: currentSeries.name
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error eliminando serie:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Duplicar serie
  async duplicateSeries(seriesId: string, userId: string, newName: string, options: {
    copy_settings?: boolean;
    copy_schedule?: boolean;
  } = {}): Promise<Series> {
    try {
      const originalSeries = await this.getSeriesById(seriesId, userId);
      if (!originalSeries) {
        throw { code: 'SERIES_NOT_FOUND', message: 'Serie no encontrada' };
      }
      
      const duplicateData: CreateSeriesData = {
        name: newName,
        description: originalSeries.description,
        frequency: options.copy_settings ? originalSeries.frequency : undefined,
        platforms: options.copy_settings ? originalSeries.platforms : [],
        target_audience: options.copy_settings ? originalSeries.target_audience : undefined,
        content_style: options.copy_settings ? originalSeries.content_style : undefined,
        voice_settings: options.copy_settings ? originalSeries.voice_settings : {},
        auto_publish: false, // Siempre false para duplicados
        publish_schedule: options.copy_schedule ? originalSeries.publish_schedule : {},
        hashtags: options.copy_settings ? originalSeries.hashtags : []
      };
      
      return await this.createSeries(userId, duplicateData);
      
    } catch (error) {
      logger.error('Error duplicando serie:', error);
      throw error;
    }
  }
  
  // Obtener estadísticas de serie
  async getSeriesStats(seriesId: string, userId: string): Promise<SeriesStats> {
    try {
      const query = `
        SELECT 
          s.id as series_id,
          COALESCE(COUNT(v.id), 0) as video_count,
          COALESCE(SUM(v.views), 0) as total_views,
          COALESCE(SUM(v.likes), 0) as total_likes,
          COALESCE(SUM(v.comments), 0) as total_comments,
          COALESCE(AVG(v.engagement_rate), 0) as engagement_rate,
          COALESCE(AVG(v.views), 0) as avg_views_per_video,
          MAX(v.created_at) as last_video_date
        FROM series s
        LEFT JOIN videos v ON s.id = v.series_id AND v.deleted_at IS NULL
        WHERE s.id = $1 AND s.user_id = $2 AND s.deleted_at IS NULL
        GROUP BY s.id
      `;
      
      const result = await pool.query(query, [seriesId, userId]);
      
      if (result.rows.length === 0) {
        throw { code: 'SERIES_NOT_FOUND', message: 'Serie no encontrada' };
      }
      
      const stats = result.rows[0];
      
      // Calcular tendencia de performance (simplificado)
      const performance_trend = await this.calculatePerformanceTrend(seriesId);
      
      // Obtener videos top performing
      const topVideos = await this.getTopPerformingVideos(seriesId, 5);
      
      return {
        series_id: stats.series_id,
        video_count: parseInt(stats.video_count),
        total_views: parseInt(stats.total_views),
        total_likes: parseInt(stats.total_likes),
        total_comments: parseInt(stats.total_comments),
        engagement_rate: parseFloat(stats.engagement_rate),
        avg_views_per_video: parseFloat(stats.avg_views_per_video),
        last_video_date: stats.last_video_date,
        performance_trend,
        top_performing_videos: topVideos
      };
      
    } catch (error) {
      logger.error('Error obteniendo estadísticas de serie:', error);
      throw error;
    }
  }
  
  // Obtener métricas del usuario
  async getUserMetrics(userId: string): Promise<UserSeriesMetrics> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_series,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_series,
          COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_series,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_series,
          SUM(video_count) as total_videos,
          SUM(total_views) as total_views,
          SUM(total_likes + total_comments) as total_engagement,
          AVG(engagement_rate) as avg_engagement_rate
        FROM series
        WHERE user_id = $1 AND deleted_at IS NULL
      `;
      
      const result = await pool.query(query, [userId]);
      const metrics = result.rows[0];
      
      // Obtener plataforma más popular y estilo más usado
      const [platformResult, styleResult] = await Promise.all([
        this.getMostPopularPlatform(userId),
        this.getMostUsedContentStyle(userId)
      ]);
      
      return {
        total_series: parseInt(metrics.total_series) || 0,
        active_series: parseInt(metrics.active_series) || 0,
        paused_series: parseInt(metrics.paused_series) || 0,
        draft_series: parseInt(metrics.draft_series) || 0,
        total_videos: parseInt(metrics.total_videos) || 0,
        total_views: parseInt(metrics.total_views) || 0,
        total_engagement: parseInt(metrics.total_engagement) || 0,
        avg_engagement_rate: parseFloat(metrics.avg_engagement_rate) || 0,
        most_popular_platform: platformResult,
        most_used_content_style: styleResult
      };
      
    } catch (error) {
      logger.error('Error obteniendo métricas del usuario:', error);
      throw error;
    }
  }
  
  // Métodos privados auxiliares
  
  private buildSeriesQuery(userId: string, filters: SeriesFilters) {
    let baseQuery = `
      SELECT s.*
      FROM series s
      WHERE s.user_id = $1 AND s.deleted_at IS NULL
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;
    
    // Filtro por estado
    if (filters.status) {
      baseQuery += ` AND s.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    // Filtro por plataformas
    if (filters.platforms && filters.platforms.length > 0) {
      baseQuery += ` AND s.platforms && $${paramIndex}`;
      params.push(filters.platforms);
      paramIndex++;
    }
    
    // Filtro por estilo de contenido
    if (filters.content_style) {
      baseQuery += ` AND s.content_style = $${paramIndex}`;
      params.push(filters.content_style);
      paramIndex++;
    }
    
    // Búsqueda por texto
    if (filters.search) {
      baseQuery += ` AND (s.name ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    // Ordenamiento
    const sortBy = filters.sortBy || 'updated_at';
    const sortOrder = filters.sortOrder || 'desc';
    baseQuery += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`;
    
    // Query para contar total
    const countQuery = baseQuery.replace(
      /SELECT s\.\*/,
      'SELECT COUNT(DISTINCT s.id) as count'
    ).replace(/ORDER BY.*$/, '');
    
    // Paginación
    const limit = filters.limit || 10;
    const offset = ((filters.page || 1) - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    return {
      query: baseQuery,
      countQuery,
      params
    };
  }
  
  private mapDatabaseToSeries(row: any): Series {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      status: row.status,
      frequency: row.frequency,
      platforms: row.platforms || [],
      target_audience: row.target_audience,
      content_style: row.content_style,
      voice_settings: typeof row.voice_settings === 'string' 
        ? JSON.parse(row.voice_settings) 
        : row.voice_settings || {},
      video_count: 0, // Por ahora 0 hasta que implementemos videos
      total_views: 0,
      total_likes: 0,
      total_comments: 0,
      engagement_rate: 0,
      auto_publish: row.auto_publish,
      publish_schedule: typeof row.publish_schedule === 'string'
        ? JSON.parse(row.publish_schedule)
        : row.publish_schedule || {},
      hashtags: row.hashtags || [],
      last_video_generated: row.last_video_generated,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at
    };
  }
  
  private async logSeriesHistory(client: any, data: {
    series_id: string;
    user_id: string;
    action: string;
    old_values?: any;
    new_values?: any;
  }): Promise<void> {
    const query = `
      INSERT INTO series_history (series_id, user_id, action, old_values, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await client.query(query, [
      data.series_id,
      data.user_id,
      data.action,
      data.old_values ? JSON.stringify(data.old_values) : null,
      data.new_values ? JSON.stringify(data.new_values) : null
    ]);
  }
  
  private async calculatePerformanceTrend(seriesId: string): Promise<'up' | 'down' | 'stable'> {
    // Implementación simplificada - comparar últimos 5 videos vs anteriores
    try {
      const query = `
        WITH recent_videos AS (
          SELECT AVG(engagement_rate) as recent_avg
          FROM (
            SELECT engagement_rate 
            FROM videos 
            WHERE series_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC 
            LIMIT 5
          ) recent
        ),
        older_videos AS (
          SELECT AVG(engagement_rate) as older_avg
          FROM (
            SELECT engagement_rate 
            FROM videos 
            WHERE series_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC 
            OFFSET 5 LIMIT 5
          ) older
        )
        SELECT 
          COALESCE(recent_videos.recent_avg, 0) as recent_avg,
          COALESCE(older_videos.older_avg, 0) as older_avg
        FROM recent_videos, older_videos
      `;
      
      const result = await pool.query(query, [seriesId]);
      const { recent_avg, older_avg } = result.rows[0];
      
      if (recent_avg > older_avg * 1.1) return 'up';
      if (recent_avg < older_avg * 0.9) return 'down';
      return 'stable';
      
    } catch (error) {
      logger.error('Error calculando tendencia de performance:', error);
      return 'stable';
    }
  }
  
  private async getTopPerformingVideos(seriesId: string, limit: number = 5): Promise<any[]> {
    try {
      const query = `
        SELECT id, title, views, engagement_rate
        FROM videos
        WHERE series_id = $1 AND deleted_at IS NULL
        ORDER BY engagement_rate DESC, views DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [seriesId, limit]);
      return result.rows;
      
    } catch (error) {
      logger.error('Error obteniendo videos top performing:', error);
      return [];
    }
  }
  
  private async getMostPopularPlatform(userId: string): Promise<any> {
    try {
      const query = `
        SELECT platform, COUNT(*) as count
        FROM (
          SELECT unnest(platforms) as platform
          FROM series
          WHERE user_id = $1 AND deleted_at IS NULL
        ) platform_counts
        GROUP BY platform
        ORDER BY count DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0]?.platform || 'tiktok';
      
    } catch (error) {
      logger.error('Error obteniendo plataforma más popular:', error);
      return 'tiktok';
    }
  }
  
  private async getMostUsedContentStyle(userId: string): Promise<any> {
    try {
      const query = `
        SELECT content_style, COUNT(*) as count
        FROM series
        WHERE user_id = $1 AND deleted_at IS NULL AND content_style IS NOT NULL
        GROUP BY content_style
        ORDER BY count DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0]?.content_style || 'educational';
      
    } catch (error) {
      logger.error('Error obteniendo estilo de contenido más usado:', error);
      return 'educational';
    }
  }
} 