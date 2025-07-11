import { Brain, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user?: { email?: string }
  onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">AI Image QA</h1>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            About
          </a>
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            How it works
          </a>
        </nav>
        
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="hidden sm:block text-sm text-gray-600">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}