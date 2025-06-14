import { useState } from 'react'
import { 
  Zap, 
  Wand2, 
  FileText, 
  Image, 
  Mic, 
  Video, 
  Settings,
  Play,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import clsx from 'clsx'

interface GenerationJob {
  id: number
  type: 'script' | 'image' | 'audio' | 'video'
  title: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  createdAt: string
  estimatedTime?: string
  result?: string
}

const mockJobs: GenerationJob[] = [
  {
    id: 1,
    type: 'video',
    title: 'Tutorial: Introducción a Machine Learning',
    status: 'completed',
    progress: 100,
    createdAt: '2024-01-15 14:30',
    result: 'video_ml_intro.mp4'
  },
  {
    id: 2,
    type: 'script',
    title: 'Guión: Tendencias IA 2024',
    status: 'processing',
    progress: 65,
    createdAt: '2024-01-15 15:15',
    estimatedTime: '2 min restantes'
  },
  {
    id: 3,
    type: 'image',
    title: 'Thumbnail: Python para principiantes',
    status: 'pending',
    progress: 0,
    createdAt: '2024-01-15 15:20',
    estimatedTime: 'En cola'
  }
]

const generationTypes = [
  {
    id: 'script',
    name: 'Generar Guión',
    description: 'Crea guiones estructurados desde prompts',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    id: 'image',
    name: 'Generar Imágenes',
    description: 'Crea thumbnails y assets visuales',
    icon: Image,
    color: 'bg-purple-500'
  },
  {
    id: 'audio',
    name: 'Generar Audio',
    description: 'Convierte texto a voz natural',
    icon: Mic,
    color: 'bg-green-500'
  },
  {
    id: 'video',
    name: 'Generar Video',
    description: 'Crea videos completos automáticamente',
    icon: Video,
    color: 'bg-red-500'
  }
]

const statusConfig = {
  pending: { 
    label: 'Pendiente', 
    color: 'bg-gray-100 text-gray-800',
    icon: Clock
  },
  processing: { 
    label: 'Procesando', 
    color: 'bg-blue-100 text-blue-800',
    icon: RefreshCw
  },
  completed: { 
    label: 'Completado', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  error: { 
    label: 'Error', 
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  }
}

export function AIGeneration() {
  const [jobs, setJobs] = useState<GenerationJob[]>(mockJobs)
  const [selectedType, setSelectedType] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!selectedType || !prompt.trim()) return

    setIsGenerating(true)
    
    // Simular generación
    const newJob: GenerationJob = {
      id: Date.now(),
      type: selectedType as any,
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      status: 'pending',
      progress: 0,
      createdAt: new Date().toLocaleString('es-ES'),
      estimatedTime: 'Iniciando...'
    }

    setJobs(prev => [newJob, ...prev])
    setPrompt('')
    setSelectedType('')
    
    // Simular progreso
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'processing', progress: 30, estimatedTime: '3 min restantes' }
          : job
      ))
    }, 1000)

    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, progress: 70, estimatedTime: '1 min restante' }
          : job
      ))
    }, 3000)

    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100, 
              result: `generated_${selectedType}_${Date.now()}.${selectedType === 'video' ? 'mp4' : selectedType === 'audio' ? 'mp3' : selectedType === 'image' ? 'png' : 'txt'}`
            }
          : job
      ))
      setIsGenerating(false)
    }, 5000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generación con IA</h1>
        <p className="mt-2 text-sm text-gray-600">
          Crea contenido automáticamente usando inteligencia artificial
        </p>
      </div>

      {/* Tipos de generación */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {generationTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={clsx(
                'relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-md',
                selectedType === type.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="flex items-center">
                <div className={clsx('rounded-lg p-2 text-white', type.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {type.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Formulario de generación */}
      {selectedType && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {generationTypes.find(t => t.id === selectedType)?.name}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Describe lo que quieres generar
              </label>
              <textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder={`Ejemplo: "Crea un tutorial sobre los fundamentos de machine learning para principiantes, explicando conceptos básicos de manera simple y visual"`}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración Avanzada
              </button>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de trabajos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Trabajos de Generación</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {jobs.map((job) => {
            const StatusIcon = statusConfig[job.status].icon
            return (
              <div key={job.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {job.type === 'script' && <FileText className="w-5 h-5 text-blue-500" />}
                        {job.type === 'image' && <Image className="w-5 h-5 text-purple-500" />}
                        {job.type === 'audio' && <Mic className="w-5 h-5 text-green-500" />}
                        {job.type === 'video' && <Video className="w-5 h-5 text-red-500" />}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {job.title}
                        </h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{job.createdAt}</span>
                          {job.estimatedTime && (
                            <span>{job.estimatedTime}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {job.status === 'processing' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progreso</span>
                          <span className="text-gray-600">{job.progress}%</span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      statusConfig[job.status].color
                    )}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[job.status].label}
                    </span>

                    {job.status === 'completed' && (
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Play className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Zap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay trabajos de generación</h3>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona un tipo de contenido y comienza a generar con IA.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 