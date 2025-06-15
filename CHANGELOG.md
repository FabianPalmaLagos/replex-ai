# Changelog - Replex AI

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-06-15

### ✅ Agregado - Fase 1.5: Sistema de Autenticación JWT Completo
- **Autenticación JWT** con access tokens (15min) y refresh tokens (7 días)
- **Registro y login** con validación robusta usando Joi
- **Verificación de email** con tokens seguros (24 horas de validez)
- **Reset de contraseña** con tokens de 1 hora y revocación automática
- **Middleware de seguridad** para autenticación y autorización por roles
- **Rate limiting específico** por endpoint (auth: 5/15min, registro: 3/hora, reset: 3/hora)
- **Sistema de emails** transaccionales con templates HTML
- **Base de datos** con tablas users y refresh_tokens + triggers automáticos
- **Usuario admin** por defecto (admin@replex-ai.com / admin123)

### 🔐 Endpoints de Autenticación
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/refresh` - Renovar tokens
- `POST /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/verify-email/:token` - Verificar email
- `POST /api/v1/auth/forgot-password` - Solicitar reset
- `POST /api/v1/auth/reset-password` - Restablecer contraseña
- `GET /api/v1/auth/me` - Información del usuario
- `GET /api/v1/auth/status` - Estado de autenticación

### 🛡️ Seguridad Implementada
- **bcrypt** con 12 salt rounds para hashing de contraseñas
- **Validación de fortaleza** de contraseña (8+ chars, mayúscula, minúscula, número)
- **Tokens seguros** generados con crypto.randomBytes
- **Sanitización** automática de entrada con Joi
- **Headers de seguridad** con helmet
- **CORS** configurado para frontend

### 📧 Sistema de Emails
- **Configuración SMTP** con nodemailer
- **Templates HTML** para verificación, reset y bienvenida
- **Manejo de errores** de envío con fallbacks
- **Variables de entorno** para configuración SMTP

### 🗄️ Base de Datos
- **Tabla users** con campos completos (email_verified, tokens, etc.)
- **Tabla refresh_tokens** con relaciones y expiración
- **Triggers automáticos** para updated_at
- **Índices optimizados** para performance
- **Función de limpieza** automática de tokens expirados

### 🐛 Corregido - Resolución de Conflictos PostgreSQL
- **Conflicto de puertos** entre PostgreSQL local (Homebrew) y Docker resuelto
- **Configuración de autenticación** scram-sha-256 para conexiones externas
- **Configuración dotenv** para cargar .env desde raíz del proyecto
- **Pool de conexiones** optimizado con timeouts apropiados

### 📚 Documentación
- **`docs/AUTHENTICATION.md`** con guía completa del sistema
- **Ejemplos de uso** y testing con curl
- **Configuración** de variables de entorno
- **Flujos de autenticación** documentados

### 📊 Métricas Fase 1.5
- **Líneas de código**: ~2,500 líneas TypeScript adicionales
- **Archivos creados**: 15 archivos nuevos
- **Dependencias**: 8 nuevas (JWT, bcrypt, Joi, nodemailer, etc.)
- **Endpoints**: 9 endpoints de autenticación
- **Tiempo de desarrollo**: ~8 horas

---

## [1.1.0] - 2025-06-14

### ✅ Agregado - Fase 1: Backend API REST
- **Servidor Express.js** funcional en puerto 3000
- **Sistema de logging** con Winston (error.log, combined.log)
- **Configuración de base de datos** PostgreSQL con pool de conexiones
- **Configuración de Redis** para cache y sesiones
- **Middleware de seguridad** (CORS, helmet, rate limiting)
- **Manejo centralizado de errores** con clases personalizadas
- **Health checks** completos con métricas del sistema
- **Estructura de rutas** preparada para escalabilidad

### 🌐 Endpoints Implementados
- `GET /` - Información del servidor
- `GET /api/v1` - Información del API
- `GET /api/v1/health` - Health check básico
- `GET /api/v1/health/detailed` - Health check con conexiones
- `GET /api/v1/health/database` - Estado PostgreSQL
- `GET /api/v1/health/cache` - Estado Redis
- `GET /api/v1/health/metrics` - Métricas del sistema

### 🔧 Configuración Técnica
- **TypeScript** configuración estricta
- **Nodemon** para hot reload en desarrollo
- **Variables de entorno** configuradas
- **Scripts npm** para desarrollo y producción
- **Graceful shutdown** con manejo de señales

### 📁 Estructura Backend Creada
```
apps/backend/
├── src/
│   ├── config/         # Database y Redis
│   ├── middleware/     # Security y ErrorHandler
│   ├── routes/         # Health y Index
│   ├── utils/          # Logger
│   └── app.ts          # Aplicación principal
├── logs/               # Archivos de log
├── package.json
├── tsconfig.json
└── README.md           # Documentación completa
```

### 📊 Métricas
- **Líneas de código**: ~800 líneas TypeScript
- **Archivos creados**: 8 archivos principales
- **Dependencias**: 14 principales + 14 dev
- **Endpoints**: 7 endpoints funcionales
- **Tiempo de desarrollo**: ~4 horas

---

## [1.0.0] - 2025-06-13

### ✅ Agregado - Fase 0.5: Frontend Completo
- **Dashboard Analytics** con métricas y gráficos (Recharts)
- **Gestión de Series** con CRUD completo
- **Generación IA** con interface de prompts
- **Navegación** sidebar responsivo y header
- **Componentes reutilizables** tipados con TypeScript

### 🎨 Tecnologías Frontend
- **React 18** con TypeScript
- **Vite 6.3.5** para desarrollo
- **Tailwind CSS 3.4** para estilos
- **Headless UI 2.2.4** para accesibilidad
- **Lucide React + Heroicons** para iconos

### 📱 Funcionalidades
- **Dashboard**: Métricas principales, gráficos interactivos, lista de videos
- **Series**: Crear, editar, eliminar, filtrar, cambiar estados
- **IA**: Interface de prompts, cola de trabajos, progreso visual
- **Responsive**: Mobile-first con breakpoints estándar

---

## [0.1.0] - 2025-06-12

### ✅ Agregado - Fase 0: Setup Inicial
- **Monorepo** configurado con workspaces
- **Docker Compose** con PostgreSQL 15 + Redis
- **Herramientas de desarrollo** (ESLint, Prettier, TypeScript)
- **Variables de entorno** configuradas
- **Scripts de inicialización** y verificación

### 🐳 Servicios Docker
- **PostgreSQL 15**: Base de datos principal (puerto 5432)
- **Redis**: Cache y sesiones (puerto 6379)
- **Adminer**: Gestión de BD (puerto 8080)
- **Redis Commander**: Gestión de Redis (puerto 8081)

### 📦 Estructura Monorepo
```
replex-ai/
├── apps/
│   ├── frontend/       # React + TypeScript
│   └── backend/        # Express.js (preparado)
├── packages/
│   ├── config/         # Configuraciones compartidas
│   ├── shared/         # Utilidades compartidas
│   └── types/          # Tipos TypeScript
├── scripts/            # Scripts de automatización
└── docker-compose.yml  # Servicios de desarrollo
```

### 🔧 Configuración
- **Node.js 18.20.0 LTS** como versión estable
- **TypeScript** configuración estricta
- **ESLint + Prettier** para calidad de código
- **Variables de entorno** con archivo .env.example

---

## Próximas Versiones

### [1.6.0] - Planificado
- **Integración frontend-backend** con sistema de autenticación
- **Gestión de series** conectada con backend
- **Dashboard** con datos reales de la API

### [2.0.0] - Planificado
- **API de gestión de series** completa
- **CRUD de series** con base de datos
- **Sistema de permisos** y roles avanzados

### [3.0.0] - Planificado
- **Motor de generación IA** (Fase 3)
- **Integración con APIs** de IA (OpenAI, Claude, etc.)
- **Sistema de queue** para procesamiento asíncrono

---

## Leyenda

- ✅ **Agregado**: Nuevas funcionalidades
- 🔧 **Cambiado**: Cambios en funcionalidades existentes
- 🐛 **Corregido**: Corrección de bugs
- ❌ **Eliminado**: Funcionalidades removidas
- 🔒 **Seguridad**: Mejoras de seguridad
- 📊 **Métricas**: Estadísticas de desarrollo 