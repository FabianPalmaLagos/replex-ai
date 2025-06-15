import { useState } from 'react'
import { DashboardAnalytics } from './components/DashboardAnalytics'
import { SeriesManager } from './components/SeriesManager'
import { AIGeneration } from './components/AIGeneration'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

type CurrentView = 'dashboard' | 'analytics' | 'series' | 'ai-generation' | 'videos' | 'scheduling' | 'audience' | 'trends' | 'settings'

// Componente principal de la aplicación autenticada
function AuthenticatedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<CurrentView>('analytics')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
      case 'analytics':
        return <DashboardAnalytics />
      case 'series':
        return <SeriesManager />
      case 'ai-generation':
        return <AIGeneration />
      case 'videos':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Videos</h2>
            <p className="mt-2 text-gray-600">Próximamente disponible</p>
          </div>
        )
      case 'scheduling':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Programación</h2>
            <p className="mt-2 text-gray-600">Próximamente disponible</p>
          </div>
        )
      case 'audience':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Audiencia</h2>
            <p className="mt-2 text-gray-600">Próximamente disponible</p>
          </div>
        )
      case 'trends':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Tendencias</h2>
            <p className="mt-2 text-gray-600">Próximamente disponible</p>
          </div>
        )
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
            <p className="mt-2 text-gray-600">Próximamente disponible</p>
          </div>
        )
      default:
        return <DashboardAnalytics />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <div className="lg:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  )
}

// Componente de autenticación
function AuthComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return <AuthenticatedApp />;
}

// Componente principal con provider de autenticación
function App() {
  return (
    <AuthProvider>
      <AuthComponent />
    </AuthProvider>
  );
}

export default App
