import React from 'react';
import { useLMS } from '../../contexts/LMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Crown
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  color?: string;
}

export const SuperAdminSidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useLMS();
  const { user } = useAuth();

  const navigationItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', color: 'purple' },
    { icon: Users, label: 'User Management', href: '/admin/users', color: 'blue' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'gray' }
  ];

  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile screen
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getHoverColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'hover:bg-blue-50 hover:text-blue-600';
      case 'purple': return 'hover:bg-purple-50 hover:text-purple-600';
      default: return 'hover:bg-gray-50 hover:text-gray-600';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        isMobile 
          ? sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
          : sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-purple-900 to-indigo-900">
            {(sidebarOpen || isMobile) && (
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-1.5 sm:p-2 rounded-lg">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white">EduNexa</h1>
                  <p className="text-xs text-purple-200">Super Admin</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-purple-800 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-white" />
              ) : (
                <ChevronRight className="h-5 w-5 text-white" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={(e) => handleNavigation(e, item.href)}
                className={`w-full flex items-center gap-3 px-2 sm:px-3 py-2.5 sm:py-3 text-gray-700 rounded-lg transition-all duration-200 group text-sm ${getHoverColor(item.color)}`}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          {(sidebarOpen || isMobile) && (
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-purple-600 font-medium">Super Administrator</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};