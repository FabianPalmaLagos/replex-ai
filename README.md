# 🎬 Replex AI

**Plataforma SaaS de Auto-Generación y Publicación de Micro-Videos**

Replex AI es una plataforma que permite auto-generar y publicar micro-videos (TikTok, YouTube Shorts, Instagram Reels) desde prompts de lenguaje natural, combinando inteligencia artificial avanzada con herramientas de edición intuitivas.

## 🚀 Características Principales

- **🤖 Automatización IA**: Generación de contenido completo desde texto
- **🎨 Control de Edición**: Editor timeline avanzado en navegador
- **📱 Publicación Seamless**: Integración directa con redes sociales
- **📊 Insights Accionables**: Analytics y optimización continua

## 🏗️ Arquitectura

### Tech Stack
- **Frontend**: React 18 + TypeScript + WebGL/Canvas
- **Backend**: Node.js 18.20.0 LTS + Express.js
- **Base de Datos**: PostgreSQL 15+ + Redis
- **Containerización**: Docker + Docker Compose
- **Video Processing**: FFmpeg/WASM + WebCodecs API

### Estructura del Monorepo
```
replex-ai/
├── apps/
│   ├── backend/          # API REST con Express.js
│   └── frontend/         # Aplicación React
├── packages/
│   ├── types/           # Tipos TypeScript compartidos
│   ├── shared/          # Utilidades compartidas
│   └── config/          # Configuraciones compartidas
├── scripts/             # Scripts de desarrollo y deployment
└── docs/               # Documentación del proyecto
```

## 🛠️ Setup de Desarrollo

### Prerrequisitos
- Node.js 18.20.0 LTS o superior
- npm 9.0.0 o superior
- Docker y Docker Compose
- Git

### Instalación Rápida

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/your-org/replex-ai.git
   cd replex-ai
   ```

2. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Instalar dependencias y levantar servicios**
   ```bash
   npm run setup
   ```

   Este comando ejecuta:
   - `npm install` - Instala todas las dependencias
   - `docker compose up -d` - Levanta PostgreSQL y Redis

4. **Verificar instalación**
   ```bash
   npm run dev
   ```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev                 # Ejecutar frontend y backend en modo desarrollo
npm run dev:backend        # Solo backend
npm run dev:frontend       # Solo frontend

# Build
npm run build              # Build de todos los workspaces
npm run test               # Ejecutar tests
npm run lint               # Linting de código
npm run format             # Formatear código con Prettier

# Docker
npm run docker:up          # Levantar servicios (PostgreSQL, Redis)
npm run docker:down        # Detener servicios
npm run docker:logs        # Ver logs de servicios
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

---

**Desarrollado con ❤️ por el equipo de Replex AI** 