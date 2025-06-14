# Frontend Replex AI

## Descripción

Frontend de la plataforma Replex AI implementado con React 18, TypeScript, Vite, Tailwind CSS y Recharts. Incluye los componentes principales del dashboard analytics y gestión de series según el plan del proyecto.

## Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **Recharts** - Librería de gráficos para React
- **Headless UI** - Componentes accesibles sin estilos
- **Heroicons** - Iconos SVG
- **Lucide React** - Iconos adicionales

## Componentes Implementados

### 1. Dashboard Analytics (`DashboardAnalytics.tsx`)
- **Métricas principales**: Visualizaciones, videos generados, engagement rate, nuevos seguidores
- **Gráficos interactivos**: 
  - Gráfico de barras para rendimiento de videos
  - Gráfico circular para distribución por plataforma
  - Gráfico de líneas para tendencias de engagement
- **Lista de videos recientes** con métricas de performance
- **Datos mock** para demostración

### 2. Gestión de Series (`SeriesManager.tsx`)
- **CRUD de series**: Crear, editar, pausar/activar, eliminar series
- **Filtros y búsqueda**: Por estado (activa, pausada, borrador) y texto
- **Información detallada**: Videos generados, frecuencia, plataformas, performance
- **Estados visuales**: Indicadores de color para diferentes estados
- **Menús contextuales** para acciones rápidas

### 3. Generación IA (`AIGeneration.tsx`)
- **Tipos de generación**: Guión, imágenes, audio, video
- **Interface de prompts**: Textarea para describir contenido a generar
- **Cola de trabajos**: Lista de trabajos con estados y progreso
- **Simulación de progreso**: Barras de progreso animadas
- **Estados de trabajo**: Pendiente, procesando, completado, error

### 4. Navegación (`Sidebar.tsx`, `Header.tsx`)
- **Sidebar responsivo**: Navegación principal con estados activos
- **Header con búsqueda**: Barra de búsqueda global y perfil de usuario
- **Navegación móvil**: Sidebar colapsable para dispositivos móviles
- **Branding**: Logo y nombre de la aplicación

## Estructura de Archivos

```
src/
├── components/
│   ├── DashboardAnalytics.tsx    # Dashboard principal con gráficos
│   ├── SeriesManager.tsx         # Gestión de series de videos
│   ├── AIGeneration.tsx          # Interface de generación IA
│   ├── Sidebar.tsx               # Navegación lateral
│   └── Header.tsx                # Cabecera con búsqueda
├── App.tsx                       # Componente principal con routing
├── main.tsx                      # Punto de entrada
└── index.css                     # Estilos globales con Tailwind
```

## Características Implementadas

### ✅ Completado
- Dashboard analytics con gráficos interactivos
- Gestión completa de series de videos
- Interface de generación IA con simulación
- Navegación responsiva entre secciones
- Diseño moderno con Tailwind CSS
- Componentes reutilizables y tipados
- Estados de carga y feedback visual

### 🔄 Próximas Implementaciones
- Gestión de videos individuales
- Programación de publicaciones
- Analytics de audiencia
- Configuración de usuario
- Integración con APIs reales

## Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Configuración

### Tailwind CSS
Configurado con:
- Colores personalizados (primary, secondary)
- Fuentes (Inter como principal)
- Espaciado y breakpoints responsivos
- Componentes y utilidades personalizadas

### Vite
Configurado con:
- Plugin de React con Fast Refresh
- TypeScript support
- Hot Module Replacement (HMR)
- Optimización de build

## Datos Mock

Los componentes utilizan datos simulados para demostración:
- Series de ejemplo con diferentes estados
- Métricas de analytics ficticias
- Trabajos de generación IA simulados
- Progreso animado para mejor UX

## Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl para diferentes tamaños
- **Sidebar colapsable**: En móvil se convierte en overlay
- **Grids adaptivos**: Columnas que se ajustan al tamaño de pantalla

## Accesibilidad

- **Headless UI**: Componentes con soporte completo de accesibilidad
- **ARIA labels**: Etiquetas descriptivas para lectores de pantalla
- **Navegación por teclado**: Soporte completo de navegación
- **Contraste de colores**: Cumple estándares WCAG

## Próximos Pasos

1. **Integración con Backend**: Conectar con APIs reales
2. **Autenticación**: Sistema de login y gestión de usuarios
3. **Editor de Timeline**: Implementar editor de video en navegador
4. **Publicación Social**: Integración con APIs de redes sociales
5. **Optimización**: Performance y caching avanzado

---

*Implementación basada en el plan del proyecto Replex AI - Enero 2025*
