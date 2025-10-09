import React from 'react';
import { useLMS } from '../../contexts/LMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Shield, 
  Database, 
  Server, 
  ChevronLeft, 
  ChevronRight,
  Crown,
  AlertTriangle,
  Activity,
  Globe,
  Lock,
  FileText,
  MessageSquare,
  Brain,
  Zap,
  UserCheck,
  Building,
  CreditCard,
  HardDrive
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
  color?: string;
}

export const SuperAdminSidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useLMS();
  const { user } = useAuth();

  const navigationItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', color: 'purple' },
    
    // User Management
    { icon: Users, label: 'User Management', href: '/admin/users', badge: 12, color: 'blue' },
    { icon: UserCheck, label: 'Role Management', href: '/admin/roles', color: 'blue' },
    { icon: Building, label: 'Institutions', href: '/admin/institutions', color: 'blue' },
    
    // Content Management
    { icon: BookOpen, label: 'Course Management', href: '/admin/courses', badge: 5, color: 'green' },
    { icon: FileText, label: 'Content Approval', href: '/admin/content', badge: 8, color: 'green' },
    { icon: MessageSquare, label: 'Communication', href: '/admin/messages', color: 'green' },
    
    // System Control
    { icon: Server, label: 'System Health', href: '/admin/system', color: 'red' },
    { icon: Database, label: 'Database Control', href: '/admin/database', color: 'red' },
    { icon: Activity, label: 'Performance', href: '/admin/performance', color: 'red' },
    { icon: HardDrive, label: 'Storage Management', href: '/admin/storage', color: 'red' },
    
    // Security & Monitoring
    { icon: Shield, label: 'Security Center', href: '/admin/security', badge: 3, color: 'yellow' },
    { icon: Lock, label: 'Access Control', href: '/admin/access', color: 'yellow' },
    { icon: AlertTriangle, label: 'System Alerts', href: '/admin/alerts', badge: 7, color: 'yellow' },
    
    // Analytics & Reports
    { icon: BarChart3, label: 'Global Analytics', href: '/admin/analytics', color: 'indigo' },
    { icon: Globe, label: 'Usage Statistics', href: '/admin/usage', color: 'indigo' },
    { icon: CreditCard, label: 'Billing & Revenue', href: '/admin/billing', color: 'indigo' },
    
    // AI & Advanced
    { icon: Brain, label: 'AI Control Center', href: '/admin/ai', color: 'purple' },
    { icon: Zap, label: 'System Automation', href: '/admin/automation', color: 'purple' },
    
    // Configuration
    { icon: Settings, label: 'Global Settings', href: '/admin/settings', color: 'gray' }
  ];

  const getHoverColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'hover:bg-blue-50 hover:text-blue-600';
      case 'green': return 'hover:bg-green-50 hover:text-green-600';
      case 'red': return 'hover:bg-red-50 hover:text-red-600';
      case 'yellow': return 'hover:bg-yellow-50 hover:text-yellow-600';
      case 'indigo': return 'hover:bg-indigo-50 hover:text-indigo-600';
      case 'purple': return 'hover:bg-purple-50 hover:text-purple-600';
      default: return 'hover:bg-gray-50 hover:text-gray-600';
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
      sidebarOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-900 to-indigo-900">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">EduNexa</h1>
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
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg transition-all duration-200 group text-sm ${getHoverColor(item.color)}`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>

        {/* Emergency Controls */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 bg-red-50">
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Emergency Stop
            </button>
          </div>
        )}

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
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
  );
};