// Controlador de Series - Manejo de requests HTTP
import { Request, Response, NextFunction } from 'express';
import { SeriesService } from '../services/seriesService';
import { 
  createSeriesSchema,
  updateSeriesSchema,
  getSeriesFiltersSchema,
  updateStatusSchema,
  duplicateSeriesSchema,
  seriesParamsSchema,
  validateSeriesData
} from '../schemas/seriesSchemas';
import { logger } from '../utils/logger';

// Extender Request para incluir usuario autenticado
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class SeriesController {
  private seriesService: SeriesService;

  constructor() {
    this.seriesService = new SeriesService();
  }

  // Crear nueva serie
  async createSeries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateSeriesData(req.body, createSeriesSchema);
      const series = await this.seriesService.createSeries(req.user.id, validatedData);
      
      logger.info('Serie creada via API', {
        seriesId: series.id,
        userId: req.user.id,
        name: series.name,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        data: series,
        message: 'Serie creada exitosamente'
      });
    } catch (error) {
      logger.error('Error en createSeries controller:', error);
      next(error);
    }
  }

  // Obtener series del usuario
  async getSeries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = validateSeriesData(req.query, getSeriesFiltersSchema);
      const result = await this.seriesService.getUserSeries(req.user.id, filters);
      
      res.json({
        success: true,
        data: result.series,
        pagination: result.pagination,
        filters: result.filters
      });
    } catch (error) {
      logger.error('Error en getSeries controller:', error);
      next(error);
    }
  }

  // Obtener serie específica
  async getSeriesById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      const series = await this.seriesService.getSeriesById(id, req.user.id);
      
      if (!series) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERIES_NOT_FOUND',
            message: 'Serie no encontrada'
          }
        });
      }

      res.json({
        success: true,
        data: series
      });
    } catch (error) {
      logger.error('Error en getSeriesById controller:', error);
      next(error);
    }
  }

  // Actualizar serie
  async updateSeries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      const updateData = validateSeriesData(req.body, updateSeriesSchema);
      
      const series = await this.seriesService.updateSeries(id, req.user.id, updateData);
      
      logger.info('Serie actualizada via API', {
        seriesId: id,
        userId: req.user.id,
        changes: Object.keys(updateData),
        ip: req.ip
      });

      res.json({
        success: true,
        data: series,
        message: 'Serie actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error en updateSeries controller:', error);
      next(error);
    }
  }

  // Actualizar estado de serie
  async updateSeriesStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      const { status } = validateSeriesData(req.body, updateStatusSchema);
      
      const series = await this.seriesService.updateSeriesStatus(id, req.user.id, status);
      
      const statusMessages = {
        active: 'activada',
        paused: 'pausada',
        draft: 'marcada como borrador'
      };

      logger.info('Estado de serie cambiado via API', {
        seriesId: id,
        userId: req.user.id,
        newStatus: status,
        ip: req.ip
      });

      res.json({
        success: true,
        data: series,
        message: `Serie ${statusMessages[status as keyof typeof statusMessages]} exitosamente`
      });
    } catch (error) {
      logger.error('Error en updateSeriesStatus controller:', error);
      next(error);
    }
  }

  // Eliminar serie
  async deleteSeries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      
      await this.seriesService.deleteSeries(id, req.user.id);
      
      logger.info('Serie eliminada via API', {
        seriesId: id,
        userId: req.user.id,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Serie eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error en deleteSeries controller:', error);
      next(error);
    }
  }

  // Duplicar serie
  async duplicateSeries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      const duplicateData = validateSeriesData(req.body, duplicateSeriesSchema);
      
      const newSeries = await this.seriesService.duplicateSeries(
        id, 
        req.user.id, 
        duplicateData.name,
        {
          copy_settings: duplicateData.copy_settings,
          copy_schedule: duplicateData.copy_schedule
        }
      );
      
      logger.info('Serie duplicada via API', {
        originalSeriesId: id,
        newSeriesId: newSeries.id,
        userId: req.user.id,
        newName: duplicateData.name,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        data: newSeries,
        message: 'Serie duplicada exitosamente'
      });
    } catch (error) {
      logger.error('Error en duplicateSeries controller:', error);
      next(error);
    }
  }

  // Obtener estadísticas de serie
  async getSeriesStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      const stats = await this.seriesService.getSeriesStats(id, req.user.id);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error en getSeriesStats controller:', error);
      next(error);
    }
  }

  // Obtener métricas del usuario
  async getUserMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await this.seriesService.getUserMetrics(req.user.id);
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Error en getUserMetrics controller:', error);
      next(error);
    }
  }

  // Búsqueda avanzada de series
  async searchSeries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchQuery = req.query.q as string;
      const filters = validateSeriesData(req.query, getSeriesFiltersSchema);
      
      if (!searchQuery || searchQuery.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SEARCH_QUERY',
            message: 'Parámetro de búsqueda "q" es requerido'
          }
        });
      }

      // Agregar búsqueda a los filtros
      const searchFilters = {
        ...filters,
        search: searchQuery.trim()
      };

      const result = await this.seriesService.getUserSeries(req.user.id, searchFilters);
      
      res.json({
        success: true,
        data: result.series,
        pagination: result.pagination,
        filters: result.filters,
        search_query: searchQuery
      });
    } catch (error) {
      logger.error('Error en searchSeries controller:', error);
      next(error);
    }
  }

  // Obtener videos de una serie
  async getSeriesVideos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      
      // Verificar que la serie existe y pertenece al usuario
      const series = await this.seriesService.getSeriesById(id, req.user.id);
      if (!series) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERIES_NOT_FOUND',
            message: 'Serie no encontrada'
          }
        });
      }

      // Por ahora retornamos array vacío ya que no tenemos tabla de videos implementada
      // TODO: Implementar cuando se cree la tabla videos
      res.json({
        success: true,
        data: [],
        message: 'Funcionalidad de videos será implementada en la siguiente fase'
      });
    } catch (error) {
      logger.error('Error en getSeriesVideos controller:', error);
      next(error);
    }
  }

  // Obtener plantillas de series
  async getSeriesTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implementar servicio para plantillas
      // Por ahora retornamos las plantillas por defecto de la base de datos
      res.json({
        success: true,
        data: [],
        message: 'Funcionalidad de plantillas será implementada próximamente'
      });
    } catch (error) {
      logger.error('Error en getSeriesTemplates controller:', error);
      next(error);
    }
  }

  // Obtener historial de cambios de una serie
  async getSeriesHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = validateSeriesData(req.params, seriesParamsSchema);
      
      // Verificar que la serie existe y pertenece al usuario
      const series = await this.seriesService.getSeriesById(id, req.user.id);
      if (!series) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERIES_NOT_FOUND',
            message: 'Serie no encontrada'
          }
        });
      }

      // TODO: Implementar método en el servicio para obtener historial
      res.json({
        success: true,
        data: [],
        message: 'Funcionalidad de historial será implementada próximamente'
      });
    } catch (error) {
      logger.error('Error en getSeriesHistory controller:', error);
      next(error);
    }
  }
}

// Crear instancia del controlador
export const seriesController = new SeriesController(); 