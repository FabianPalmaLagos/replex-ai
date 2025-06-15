// Rutas de Series - API REST para gestión de series
import { Router } from 'express';
import { seriesController } from '../controllers/seriesController';
import { AuthMiddleware } from '../middleware/auth';
import { createRateLimit } from '../middleware/rateLimiter';
import { pool } from '../config/database';

const router = Router();

// Crear instancia del middleware de autenticación
const authMiddleware = new AuthMiddleware(pool);

// Rate limiting específico para series
const seriesRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.'
    }
  }
});

const createSeriesRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 series por hora
  message: {
    success: false,
    error: {
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      message: 'Límite de creación de series alcanzado. Intenta de nuevo en 1 hora.'
    }
  }
});

// Aplicar autenticación y rate limiting a todas las rutas
router.use(authMiddleware.authenticate);
router.use(seriesRateLimit);

// === RUTAS PRINCIPALES DE SERIES ===

// GET /api/v1/series - Obtener series del usuario con filtros y paginación
router.get('/', seriesController.getSeries.bind(seriesController));

// POST /api/v1/series - Crear nueva serie
router.post('/', createSeriesRateLimit, seriesController.createSeries.bind(seriesController));

// GET /api/v1/series/search - Búsqueda avanzada de series
router.get('/search', seriesController.searchSeries.bind(seriesController));

// GET /api/v1/series/metrics - Obtener métricas agregadas del usuario
router.get('/metrics', seriesController.getUserMetrics.bind(seriesController));

// GET /api/v1/series/templates - Obtener plantillas de series
router.get('/templates', seriesController.getSeriesTemplates.bind(seriesController));

// === RUTAS ESPECÍFICAS POR ID ===

// GET /api/v1/series/:id - Obtener serie específica
router.get('/:id', seriesController.getSeriesById.bind(seriesController));

// PUT /api/v1/series/:id - Actualizar serie completa
router.put('/:id', seriesController.updateSeries.bind(seriesController));

// PATCH /api/v1/series/:id/status - Cambiar estado de serie
router.patch('/:id/status', seriesController.updateSeriesStatus.bind(seriesController));

// DELETE /api/v1/series/:id - Eliminar serie (soft delete)
router.delete('/:id', seriesController.deleteSeries.bind(seriesController));

// POST /api/v1/series/:id/duplicate - Duplicar serie
router.post('/:id/duplicate', seriesController.duplicateSeries.bind(seriesController));

// GET /api/v1/series/:id/stats - Obtener estadísticas de serie
router.get('/:id/stats', seriesController.getSeriesStats.bind(seriesController));

// GET /api/v1/series/:id/videos - Obtener videos de la serie
router.get('/:id/videos', seriesController.getSeriesVideos.bind(seriesController));

// GET /api/v1/series/:id/history - Obtener historial de cambios
router.get('/:id/history', seriesController.getSeriesHistory.bind(seriesController));

export default router; 