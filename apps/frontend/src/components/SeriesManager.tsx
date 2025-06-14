import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Calendar,
  Video,
  TrendingUp
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import clsx from 'clsx'

interface Series {
  id: number
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  videosCount: number
  lastGenerated: string
  frequency: string
  platform: string[]
  performance: {
    views: string
    engagement: string
  }
}

const mockSeries: Series[] = [
  {
    id: 1,
    name: 'Tutoriales de IA',
    description: 'Serie educativa sobre inteligencia artificial para principiantes',
    status: 'active',
    videosCount: 24,
    lastGenerated: '2024-01-15',
    frequency: 'Diario',
    platform: ['TikTok', 'Instagram'],
    performance: { views: '1.2M', engagement: '8.5%' }
  },
  {
    id: 2,
    name: 'Tendencias Tech',
    description: 'Análisis de las últimas tendencias en tecnología',
    status: 'active',
    videosCount: 18,
    lastGenerated: '2024-01-14',
    frequency: 'Semanal',
    platform: ['YouTube', 'Instagram'],
    performance: { views: '890K', engagement: '6.2%' }
  },
  {
    id: 3,
    name: 'Python para Todos',
    description: 'Curso completo de programación en Python',
    status: 'paused',
    videosCount: 12,
    lastGenerated: '2024-01-10',
    frequency: 'Bi-semanal',
    platform: ['YouTube'],
    performance: { views: '456K', engagement: '9.1%' }
  },
  {
    id: 4,
    name: 'Automatización Diaria',
    description: 'Tips y trucos para automatizar tareas cotidianas',
    status: 'draft',
    videosCount: 0,
    lastGenerated: '-',
    frequency: 'Diario',
    platform: ['TikTok'],
    performance: { views: '-', engagement: '-' }
  }
]

const statusConfig = {
  active: { label: 'Activa', color: 'bg-green-100 text-green-800' },
  paused: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-800' },
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' }
}

export function SeriesManager() {
  const [series, setSeries] = useState<Series[]>(mockSeries)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredSeries = series.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (seriesId: number, newStatus: 'active' | 'paused') => {
    setSeries(prev => prev.map(s => 
      s.id === seriesId ? { ...s, status: newStatus } : s
    ))
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
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="paused">Pausadas</option>
          <option value="draft">Borradores</option>
        </select>
      </div>

      {/* Lista de series */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {filteredSeries.map((serie) => (
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
                          {serie.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusConfig[serie.status].color
                        )}>
                          {statusConfig[serie.status].label}
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
                                      Activar
                                    </button>
                                  )}
                                </Menu.Item>
                              )}
                              <Menu.Item>
                                {({ active }) => (
                                  <button
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
                        {serie.videosCount} videos
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {serie.frequency}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {serie.performance.views} vistas
                      </div>
                      <div className="text-gray-500">
                        Engagement: {serie.performance.engagement}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {serie.platform.map((platform) => (
                        <span
                          key={platform}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredSeries.length === 0 && (
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
                type="button"
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Serie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 