import { Router } from 'express';
import healthRoutes from './health';

const router = Router();

// Rutas de health check
router.use('/health', healthRoutes);

// Ruta de bienvenida del API
router.get('/', (req, res) => {
  res.json({
    message: '🚀 Replex AI API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    documentation: '/api/v1/docs', // Para futuro Swagger
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth', // Para futuro
      series: '/api/v1/series', // Para futuro
      users: '/api/v1/users', // Para futuro
    }
  });
});

// TODO: Agregar rutas de autenticación (Issue #2)
// router.use('/auth', authRoutes);

// TODO: Agregar rutas de series (Issue #4)
// router.use('/series', seriesRoutes);

// TODO: Agregar rutas de usuarios (Issue #2)
// router.use('/users', userRoutes);

export default router; 