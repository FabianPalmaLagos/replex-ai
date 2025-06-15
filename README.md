# 🎬 Replex AI

## 📋 Descripción

**Replex AI** es una plataforma SaaS que permite auto-generar y publicar micro-videos (TikTok, YouTube Shorts, Instagram Reels) desde prompts de lenguaje natural, combinando inteligencia artificial avanzada con herramientas de edición intuitivas.

## 🎯 Estado del Proyecto

### ✅ **Completado (50% del proyecto)**
- **Fase 0**: Setup entorno y arquitectura base
- **Fase 0.5**: Frontend React completo y funcional
- **Fase 1**: Backend API REST con Express.js
- **Fase 1.5**: Sistema de autenticación JWT completo

### 🔄 **En Desarrollo**
- **Próximo**: Integración frontend-backend
- **Próximo**: Gestión de series de videos

### 📍 **URLs de Desarrollo**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/api/v1/health
- **Autenticación**: http://localhost:3000/api/v1/auth
- **Adminer (DB)**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

### 🔐 **Credenciales de Prueba**
- **Admin**: admin@replex-ai.com / admin123
- **Base de datos**: replex_user / replex_password

## 🚀 Características Principales

- **🤖 Automatización IA**: Generación de contenido completo desde texto
- **🎨 Control de Edición**: Editor timeline avanzado en navegador
- **📱 Publicación Seamless**: Integración directa con redes sociales
- **📊 Insights Accionables**: Analytics y optimización continua

## 🏗️ Arquitectura Técnica

#### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS 3.4 ✅ **FUNCIONAL**
- **Backend**: Node.js 18.20.0 LTS + Express.js ✅ **FUNCIONAL**
- **Base de Datos**: PostgreSQL 15+ + Redis ✅ **CONFIGURADO**
- **Containerización**: Docker + Docker Compose ✅ **CONFIGURADO**
- **Video Processing**: FFmpeg/WASM + WebCodecs API *(por desarrollar)*

### Estructura del Monorepo
```
replex-ai/
├── apps/
│   ├── frontend/              # React + TypeScript + Tailwind
│   │   ├── src/
│   │   │   ├── components/    # Componentes React
│   │   │   │   ├── App.tsx        # Aplicación principal
│   │   │   │   └── main.tsx       # Punto de entrada
│   │   │   └── package.json
│   └── backend/               # Express.js API REST + JWT Auth ✅ FUNCIONAL
│   └── packages/
│       ├── config/                # Configuraciones compartidas
│       ├── shared/                # Utilidades compartidas
│       └── types/                 # Tipos TypeScript
├── scripts/                   # Scripts de automatización
├── docker-compose.yml         # Servicios de base de datos
├── package.json               # Configuración monorepo
└── README.md
```

## 🚀 Instalación y Ejecución

#### Prerrequisitos
- Node.js 18.20.0 LTS
- Docker y Docker Compose
- npm 10.5.0+

#### Configuración Inicial

```bash
# Clonar repositorio
git clone <repository-url>
cd replex-ai

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env

# Iniciar servicios de base de datos
docker-compose up -d

# Ejecutar aplicación completa
npm run dev
```

#### Comandos Disponibles

```bash
# Desarrollo
npm run dev:frontend          # Inicia frontend en http://localhost:5173
npm run dev:backend           # Inicia backend en http://localhost:3000
npm run dev                   # Ambos servicios en paralelo

# Base de datos
docker-compose up -d          # Inicia PostgreSQL + Redis
docker-compose down           # Detiene servicios

# Build
npm run build:frontend        # Build de producción frontend
npm run build:backend         # Build backend (por implementar)
```

## 🐳 Servicios Docker

### Servicios Principales
- **PostgreSQL** (puerto 5432): Base de datos principal
- **Redis** (puerto 6379): Cache y sesiones

### Servicios de Desarrollo
- **Adminer** (puerto 8080): Gestión de base de datos
- **Redis Commander** (puerto 8081): Gestión de Redis

Para acceder a las herramientas de desarrollo:
```bash
docker compose --profile dev up -d
```

## 📁 Estructura de Packages

### @replex/types
Tipos TypeScript compartidos entre frontend y backend.

### @replex/shared
Utilidades y funciones compartidas.

### @replex/config
Configuraciones compartidas del proyecto.

## 🔧 Configuración

### Variables de Entorno
Copia `env.example` a `.env` y configura:

- **Base de datos**: Configuración de PostgreSQL
- **Cache**: Configuración de Redis
- **APIs de IA**: OpenAI, Anthropic, Stability AI
- **Text-to-Speech**: ElevenLabs, Google Cloud TTS
- **Redes Sociales**: TikTok, Instagram, YouTube
- **Almacenamiento**: AWS S3

### Base de Datos
La base de datos se inicializa automáticamente con:
- Extensiones: `uuid-ossp`, `pgcrypto`
- Esquemas: `auth`, `content`, `analytics`
- Funciones: Timestamps automáticos

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests por workspace
npm run test --workspace=apps/backend
npm run test --workspace=apps/frontend
```

## 📝 Linting y Formateo

```bash
# Linting
npm run lint

# Formateo automático
npm run format
```

## 🚀 Deployment

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📊 Monitoreo

### Logs
```bash
# Logs de servicios Docker
npm run docker:logs

# Logs específicos
docker compose logs postgres
docker compose logs redis
```

### Health Checks
Los servicios incluyen health checks automáticos:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- TypeScript estricto
- ESLint + Prettier
- Commits convencionales
- Tests obligatorios para nuevas features

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/replex-ai/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/your-org/replex-ai/discussions)

## 🗺️ Roadmap

Ver [plan-proyecto-replex-ai.md](./plan-proyecto-replex-ai.md) para el plan completo del proyecto.

### Próximas Fases
- ✅ **Fase 0**: Setup entorno y arquitectura base (Actual)
- 🔄 **Fase 1**: Autenticación e infraestructura core
- 📋 **Fase 2**: Gestión de series y prompts
- 🤖 **Fase 3**: Motor de generación de contenido IA

### ✅ Estado de Desarrollo

#### Completado
- **Infraestructura Base**: Monorepo configurado con workspaces
- **Base de Datos**: PostgreSQL 15+ + Redis funcionando en Docker
- **Frontend Core**: 
  - Dashboard Analytics con gráficos interactivos (Recharts)
  - Gestión de Series de videos (CRUD completo)
  - Interface de Generación IA (simulación funcional)
  - Navegación responsiva completa
  - Componentes reutilizables con TypeScript

#### Por Desarrollar
- **Backend**: API REST con Express.js
- **Autenticación**: Sistema de usuarios y sesiones
- **Motor IA**: Integración con APIs de generación de contenido
- **Procesamiento Audio**: Text-to-Speech y mixing automático
- **Editor Timeline**: Editor de video en navegador
- **Integración Social**: APIs de TikTok, Instagram, YouTube
- **Analytics Avanzado**: Métricas reales de plataformas
- **Moderación**: Sistema de filtrado de contenido

### 📊 Componentes Frontend

#### Dashboard Analytics
- Métricas principales (visualizaciones, videos, engagement, seguidores)
- Gráficos de barras, líneas y circulares
- Lista de videos recientes con performance
- Distribución por plataforma

#### Gestión de Series
- CRUD completo de series de videos
- Filtros por estado y búsqueda
- Estados: activa, pausada, borrador
- Métricas de performance por serie

#### Generación IA
- Interface para tipos de contenido (guión, imagen, audio, video)
- Sistema de prompts con textarea
- Cola de trabajos con estados y progreso
- Simulación de generación con barras de progreso

#### Navegación
- Sidebar responsivo con estados activos
- Header con búsqueda global
- Navegación móvil colapsable
- Routing entre secciones

### 🔧 Configuración de Desarrollo

#### Variables de Entorno
```bash
# Base de datos
DATABASE_URL=postgresql://replex:password@localhost:5432/replex_db
REDIS_URL=redis://localhost:6379

# Puertos
FRONTEND_PORT=5173
BACKEND_PORT=3000
```

#### Puertos Utilizados
- **Frontend**: http://localhost:5173
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Adminer**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

### 📝 Notas de Desarrollo

- El frontend utiliza datos mock para demostración
- La navegación entre secciones está completamente funcional
- Los componentes están tipados con TypeScript
- El diseño es completamente responsivo
- Todos los componentes siguen principios de accesibilidad

---

*Última actualización: Enero 2025*

**Desarrollado con ❤️ por el equipo de Replex AI** 