import { useState, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Calendar,
  Video,
  TrendingUp,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import clsx from 'clsx'
import { 
  useSeries, 
  useSeriesOperations, 
  useUpdateSeriesStatus,
  useDeleteSeries,
  useDuplicateSeries 
} from '../hooks/useSeries'
import { 
  Series, 
  CreateSeriesData, 
  UpdateSeriesData, 
  SeriesFilters,
  statusConfig,
  platformConfig,
  contentStyleConfig 
} from '../types/series'
import { SeriesForm } from './SeriesForm'

export function SeriesManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | undefined>()

  // Construir filtros para la API
  const filters: SeriesFilters = useMemo(() => ({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    sortBy: 'updated_at',
    sortOrder: 'desc'
  }), [currentPage, searchTerm, statusFilter])

  // Hooks de React Query
  const { data: seriesData, isLoading, error, refetch } = useSeries(filters)
  const { createSeries, updateSeries } = useSeriesOperations()
  const updateStatus = useUpdateSeriesStatus()
  const deleteSeries = useDeleteSeries()
  const duplicateSeries = useDuplicateSeries()

  // Funciones de manejo
  const handleCreateSeries = async (data: CreateSeriesData) => {
    try {
      await createSeries.mutateAsync(data)
      setIsFormOpen(false)
    } catch (error) {
      // Error manejado por el hook
    }
  }

  const handleUpdateSeries = async (data: UpdateSeriesData) => {
    if (!editingSeries) return
    
    try {
      await updateSeries.mutateAsync({ id: editingSeries.id, data })
      setIsFormOpen(false)
      setEditingSeries(undefined)
    } catch (error) {
      // Error manejado por el hook
    }
  }

  const handleStatusChange = async (seriesId: string, newStatus: 'active' | 'paused' | 'draft') => {
    try {
      await updateStatus.mutateAsync({ id: seriesId, status: newStatus })
    } catch (error) {
      // Error manejado por el hook
    }
  }

  const handleDeleteSeries = async (seriesId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta serie? Esta acción no se puede deshacer.')) {
      try {
        await deleteSeries.mutateAsync(seriesId)
      } catch (error) {
        // Error manejado por el hook
      }
    }
  }

  const handleDuplicateSeries = async (seriesId: string, seriesName: string) => {
    const newName = prompt('Nombre para la serie duplicada:', `${seriesName} (Copia)`)
    if (newName) {
      try {
        await duplicateSeries.mutateAsync({ 
          id: seriesId, 
          options: { name: newName, copy_videos: false }
        })
      } catch (error) {
        // Error manejado por el hook
      }
    }
  }

  const handleEditSeries = (series: Series) => {
    setEditingSeries(series)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingSeries(undefined)
  }

  // Formatear datos para mostrar
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatEngagement = (rate: number) => {
    return `${rate.toFixed(1)}%`
  }

  const series = seriesData?.series || []
  const pagination = seriesData?.pagination

  // Mostrar error si hay problemas con la API
  if (error) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Series</h1>
            <p className="mt-2 text-sm text-gray-600">
              Administra tus series de videos automatizadas
            </p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar las series
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Hubo un problema al conectar con el servidor. Por favor, intenta de nuevo.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Series</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra tus series de videos automatizadas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            disabled={isLoading}
          >
            <RefreshCw className={clsx("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Serie
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="paused">Pausadas</option>
          <option value="draft">Borradores</option>
        </select>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Cargando series...</p>
          </div>
        </div>
      )}

      {/* Lista de series */}
      {!isLoading && series.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {series.map((serie) => (
              <li key={serie.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {serie.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {serie.description || 'Sin descripción'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            statusConfig[serie.status].color
                          )}>
                            {statusConfig[serie.status].icon} {statusConfig[serie.status].label}
                          </span>
                          <Menu as="div" className="relative">
                            <Menu.Button className="p-2 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEditSeries(serie)}
                                      className={clsx(
                                        active ? 'bg-gray-100' : '',
                                        'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                                      )}
                                    >
                                      <Edit className="w-4 h-4 mr-3" />
                                      Editar
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDuplicateSeries(serie.id, serie.name)}
                                      className={clsx(
                                        active ? 'bg-gray-100' : '',
                                        'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                                      )}
                                    >
                                      <Copy className="w-4 h-4 mr-3" />
                                      Duplicar
                                    </button>
                                  )}
                                </Menu.Item>
                                {serie.status === 'active' ? (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleStatusChange(serie.id, 'paused')}
                                        className={clsx(
                                          active ? 'bg-gray-100' : '',
                                          'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                                        )}
                                      >
                                        <Pause className="w-4 h-4 mr-3" />
                                        Pausar
                                      </button>
                                    )}
                                  </Menu.Item>
                                ) : serie.status === 'paused' ? (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleStatusChange(serie.id, 'active')}
                                        className={clsx(
                                          active ? 'bg-gray-100' : '',
                                          'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                                        )}
                                      >
                                        <Play className="w-4 h-4 mr-3" />
                                        Activar
                                      </button>
                                    )}
                                  </Menu.Item>
                                ) : (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleStatusChange(serie.id, 'active')}
                                        className={clsx(
                                          active ? 'bg-gray-100' : '',
                                          'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                                        )}
                                      >
                                        <Play className="w-4 h-4 mr-3" />
                                        Publicar
                                      </button>
                                    )}
                                  </Menu.Item>
                                )}
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDeleteSeries(serie.id)}
                                      className={clsx(
                                        active ? 'bg-gray-100' : '',
                                        'flex w-full items-center px-4 py-2 text-sm text-red-700'
                                      )}
                                    >
                                      <Trash2 className="w-4 h-4 mr-3" />
                                      Eliminar
                                    </button>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <Video className="w-4 h-4 mr-2" />
                          {serie.video_count} videos
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(serie.last_video_generated)}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {formatNumber(serie.total_views)} vistas
                        </div>
                        <div className="text-gray-500">
                          Engagement: {formatEngagement(serie.engagement_rate)}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {serie.platforms.map((platform) => (
                          <span
                            key={platform}
                            className={clsx(
                              'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                              platformConfig[platform]?.color || 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {platformConfig[platform]?.icon} {platformConfig[platform]?.name || platform}
                          </span>
                        ))}
                        {serie.content_style && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                            {contentStyleConfig[serie.content_style]?.icon} {contentStyleConfig[serie.content_style]?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paginación */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-md shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={clsx(
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!isLoading && series.length === 0 && (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay series</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron series con los filtros aplicados.'
              : 'Comienza creando tu primera serie de videos.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Serie
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulario */}
      <SeriesForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingSeries ? handleUpdateSeries : handleCreateSeries}
        series={editingSeries}
        isLoading={createSeries.isPending || updateSeries.isPending}
        title={editingSeries ? 'Editar Serie' : 'Nueva Serie'}
      />
    </div>
  )
} 