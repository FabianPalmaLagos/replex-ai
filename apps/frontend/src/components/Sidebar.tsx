import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  BarChart3,
  Video,
  Settings,
  Users,
  FileText,
  Calendar,
  X,
  Home,
  Zap,
  TrendingUp
} from 'lucide-react'
import clsx from 'clsx'

type CurrentView = 'dashboard' | 'analytics' | 'series' | 'ai-generation' | 'videos' | 'scheduling' | 'audience' | 'trends' | 'settings'

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: Home },
  { name: 'Analytics', id: 'analytics', icon: BarChart3 },
  { name: 'Videos', id: 'videos', icon: Video },
  { name: 'Series', id: 'series', icon: FileText },
  { name: 'Generación IA', id: 'ai-generation', icon: Zap },
  { name: 'Programación', id: 'scheduling', icon: Calendar },
  { name: 'Audiencia', id: 'audience', icon: Users },
  { name: 'Tendencias', id: 'trends', icon: TrendingUp },
]

const secondaryNavigation = [
  { name: 'Configuración', id: 'settings', icon: Settings },
]

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentView: CurrentView
  setCurrentView: (view: CurrentView) => void
}

export function Sidebar({ open, setOpen, currentView, setCurrentView }: SidebarProps) {
  const handleNavigation = (viewId: string) => {
    setCurrentView(viewId as CurrentView)
    setOpen(false) // Cerrar sidebar en móvil después de navegar
  }

  const NavigationItems = ({ items, isSecondary = false }: { items: typeof navigation, isSecondary?: boolean }) => (
    <ul role="list" className="-mx-2 space-y-1">
      {items.map((item) => (
        <li key={item.name}>
          <button
            onClick={() => handleNavigation(item.id)}
            className={clsx(
              currentView === item.id
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left'
            )}
          >
            <item.icon
              className={clsx(
                currentView === item.id ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                'h-6 w-6 shrink-0'
              )}
              aria-hidden="true"
            />
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setOpen(false)}>
                      <span className="sr-only">Cerrar sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="ml-3 text-xl font-bold text-gray-900">Replex AI</span>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <NavigationItems items={navigation} />
                      </li>
                      <li className="mt-auto">
                        <NavigationItems items={secondaryNavigation} isSecondary />
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Replex AI</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <NavigationItems items={navigation} />
              </li>
              <li className="mt-auto">
                <NavigationItems items={secondaryNavigation} isSecondary />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
} 