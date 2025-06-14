import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Video, 
  Eye, 
  Heart,
  Share2,
  MessageCircle
} from 'lucide-react'

// Datos de ejemplo para los gráficos
const videoPerformanceData = [
  { name: 'Ene', views: 4000, likes: 2400, shares: 800 },
  { name: 'Feb', views: 3000, likes: 1398, shares: 600 },
  { name: 'Mar', views: 2000, likes: 9800, shares: 1200 },
  { name: 'Abr', views: 2780, likes: 3908, shares: 900 },
  { name: 'May', views: 1890, likes: 4800, shares: 700 },
  { name: 'Jun', views: 2390, likes: 3800, shares: 1100 },
]

const platformData = [
  { name: 'TikTok', value: 45, color: '#ff0050' },
  { name: 'Instagram', value: 30, color: '#e4405f' },
  { name: 'YouTube', value: 25, color: '#ff0000' },
]

const recentVideos = [
  { id: 1, title: 'Tutorial de IA para principiantes', views: '125K', likes: '8.2K', platform: 'TikTok' },
  { id: 2, title: 'Tendencias de tecnología 2024', views: '89K', likes: '5.1K', platform: 'Instagram' },
  { id: 3, title: 'Automatización con Python', views: '67K', likes: '3.8K', platform: 'YouTube' },
  { id: 4, title: 'Machine Learning explicado', views: '156K', likes: '12.3K', platform: 'TikTok' },
]

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`ml-2 text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
        <span className="ml-2 text-sm text-gray-500">vs mes anterior</span>
      </div>
    </div>
  )
}

export function DashboardAnalytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Resumen del rendimiento de tus videos generados con IA
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Visualizaciones"
          value="2.4M"
          change="+12.5%"
          trend="up"
          icon={<Eye className="w-5 h-5 text-primary-600" />}
        />
        <MetricCard
          title="Videos Generados"
          value="156"
          change="+8.2%"
          trend="up"
          icon={<Video className="w-5 h-5 text-primary-600" />}
        />
        <MetricCard
          title="Engagement Rate"
          value="7.8%"
          change="-2.1%"
          trend="down"
          icon={<Heart className="w-5 h-5 text-primary-600" />}
        />
        <MetricCard
          title="Nuevos Seguidores"
          value="12.3K"
          change="+15.3%"
          trend="up"
          icon={<Users className="w-5 h-5 text-primary-600" />}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Rendimiento de Videos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rendimiento de Videos (Últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={videoPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" name="Visualizaciones" />
              <Bar dataKey="likes" fill="#10b981" name="Likes" />
              <Bar dataKey="shares" fill="#f59e0b" name="Compartidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Plataforma */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribución por Plataforma
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendencia de Engagement */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tendencia de Engagement
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={videoPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="likes" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Likes"
            />
            <Line 
              type="monotone" 
              dataKey="shares" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Compartidos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Videos Recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Videos Recientes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentVideos.map((video) => (
            <div key={video.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{video.title}</h4>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {video.views}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {video.likes}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {video.platform}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 