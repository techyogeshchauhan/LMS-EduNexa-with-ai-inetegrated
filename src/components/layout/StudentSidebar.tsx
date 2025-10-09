import React, { useState, useEffect } from 'react';
import { useLMS } from '../../contexts/LMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../config/api';
import { 
  Home, 
  BookOpen, 
  FileText as Assignment, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Brain, 
  Trophy, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Bell,
  User
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

export const StudentSidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useLMS();
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);

  // Fetch unread counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const notifData = await notificationsAPI.getUnreadCount();
        setUnreadNotifications((notifData as any).unread_count || 0);
        
        // TODO: Fetch actual counts from APIs when ready
        setUnreadMessages(0);
        setPendingAssignments(0);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    if (user) {
      fetchCounts();
      
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navigationItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', href: '/courses' },
    { icon: Assignment, label: 'Assignments', href: '/assignments', badge: pendingAssignments || undefined },
    { icon: MessageSquare, label: 'Discussions', href: '/discussions', badge: unreadMessages || undefined },
    { icon: BarChart3, label: 'My Progress', href: '/analytics' },
    { icon: Brain, label: 'AI Assistant', href: '/ai-assistant' },
    { icon: Calendar, label: 'Schedule', href: '/schedule' },
    { icon: Trophy, label: 'Achievements', href: '/achievements' },
    { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadNotifications || undefined },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
      sidebarOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">EduNexa</h1>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
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

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">Student</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};