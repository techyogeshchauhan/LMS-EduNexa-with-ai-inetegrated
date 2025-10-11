import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLMS } from '../../contexts/LMSContext';
import LearnerAlerts from '../notifications/LearnerAlerts';
import { notificationsAPI } from '../../config/api';
import {
  Search,
  Bell,
  MessageSquare,
  LogOut,
  User,
  Menu
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { setSidebarOpen } = useLMS();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const notifData = await notificationsAPI.getUnreadCount();
        setUnreadNotifications((notifData as any).unread_count || 0);
        
        // TODO: Implement messages API when ready
        // For now, keep messages at 0
        setUnreadMessages(0);
      } catch (error) {
        console.error('Failed to fetch unread counts:', error);
      }
    };

    if (user) {
      fetchUnreadCounts();
      
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchUnreadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* Learner Alerts (for teachers and admins) - Hidden on mobile */}
          {user && ['teacher', 'super_admin'].includes(user.role) && (
            <div className="hidden md:block">
              <LearnerAlerts />
            </div>
          )}

          {/* Notifications */}
          <a href="/notifications" className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </a>

          {/* Messages - Hidden on small mobile */}
          <a href="/messages" className="hidden xs:block relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-green-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </a>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </a>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};