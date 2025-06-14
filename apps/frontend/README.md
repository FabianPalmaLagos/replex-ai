# Frontend Replex AI

## Descripción

Frontend de la plataforma Replex AI implementado con React 18, TypeScript, Vite y Tailwind CSS 3.4. Incluye dashboard analytics, gestión de series y generación IA con datos simulados.

## Tecnologías

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite 6.3.5** - Build tool y servidor de desarrollo
- **Tailwind CSS 3.4** - Framework de estilos
- **Recharts 2.15.3** - Gráficos interactivos
- **Headless UI 2.2.4** - Componentes accesibles
- **Heroicons 2.2.0** - Iconos SVG
- **Lucide React 0.507.0** - Iconos adicionales

## Instalación y Ejecución

```bash
# Desde la raíz del proyecto
npm run dev:frontend

# O desde apps/frontend
cd apps/frontend
npm install
npm run dev
```

**URL de desarrollo**: http://localhost:5173

## Comandos Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Linting con ESLint
```

## Componentes Implementados

### Dashboard Analytics
- Métricas principales con iconos y tendencias
- Gráfico de barras para rendimiento de videos
- Gráfico circular para distribución por plataforma
- Gráfico de líneas para tendencias de engagement
- Lista de videos recientes con métricas

### Gestión de Series
- Lista de series con filtros y búsqueda
- Estados: activa, pausada, borrador
- Menús contextuales para acciones (editar, pausar/activar, eliminar)
- Información detallada: videos generados, frecuencia, plataformas
- Métricas de performance por serie

### Generación IA
- Selección de tipos de contenido (guión, imagen, audio, video)
- Interface de prompts con textarea
- Cola de trabajos con estados y progreso
- Simulación de generación con barras de progreso animadas
- Estados: pendiente, procesando, completado, error

### Navegación
- Sidebar responsivo con navegación entre secciones
- Header con búsqueda global y perfil de usuario
- Navegación móvil colapsable
- Estados activos en navegación

## Estructura de Archivos

```
src/
├── components/
│   ├── DashboardAnalytics.tsx    # Dashboard principal
│   ├── SeriesManager.tsx         # Gestión de series
│   ├── AIGeneration.tsx          # Interface de generación IA
│   ├── Sidebar.tsx               # Navegación lateral
│   └── Header.tsx                # Cabecera
├── App.tsx                       # Componente principal
├── main.tsx                      # Punto de entrada
└── index.css                     # Estilos globales
```

## Configuración

### Tailwind CSS
- Configurado con colores personalizados (primary)
- Responsive design con breakpoints estándar
- Componentes y utilidades personalizadas

### Vite
- Plugin de React con Fast Refresh
- TypeScript support
- Hot Module Replacement (HMR)

## Datos Mock

Los componentes utilizan datos simulados:
- Series de ejemplo con diferentes estados
- Métricas de analytics ficticias
- Trabajos de generación IA simulados
- Progreso animado para demostración

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar colapsable en móvil
- Grids adaptivos según tamaño de pantalla

## Accesibilidad

- Headless UI para componentes accesibles
- ARIA labels para lectores de pantalla
- Navegación por teclado
- Contraste de colores según estándares WCAG

## Estado de Desarrollo

### ✅ Completado
- Dashboard analytics con gráficos interactivos
- Gestión completa de series de videos
- Interface de generación IA con simulación
- Navegación responsiva entre secciones
- Componentes reutilizables y tipados
- Estados de carga y feedback visual

### Por Desarrollar
- Integración con APIs reales del backend
- Sistema de autenticación
- Editor de timeline para videos
- Gestión de videos individuales
- Programación de publicaciones
- Analytics de audiencia real
- Configuración de usuario

---

*Versión actual: Frontend funcional con datos mock*
