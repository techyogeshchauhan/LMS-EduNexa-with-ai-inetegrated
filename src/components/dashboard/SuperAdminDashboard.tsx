import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatsCard } from './StatsCard';
import LearnerInsights from './LearnerInsights';
import {
  Users,
  BookOpen,
  TrendingUp,
  Shield,
  BarChart3,
  Activity,
  Crown,
  Zap,
  Globe,
  Server,
  Database
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statsData = [
    { title: 'Total Users', value: '1,247', icon: Users, color: 'blue' as const, change: '+12% this month' },
    { title: 'System Uptime', value: '99.9%', icon: Server, color: 'green' as const, change: '30 days stable' },
    { title: 'Security Score', value: '98/100', icon: Shield, color: 'purple' as const, change: 'Excellent' },
    { title: 'Global Revenue', value: '$124,580', icon: TrendingUp, color: 'yellow' as const, change: '+25% this quarter' }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-400" />
              {getGreeting()}, {user?.name}! 👑
            </h1>
            <p className="text-purple-100 text-lg mb-4">
              Complete system control and oversight dashboard
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Global Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Maximum Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Full Control</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Crown className="h-24 w-24 text-yellow-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType="positive"
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Super Admin Control Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User & Institution Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            User Management
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/admin/users');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors"
            >
              <div className="font-medium text-blue-900">Manage All Users</div>
              <div className="text-xs text-blue-700">1,247 total users</div>
            </button>
            <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-blue-900">Role Management</div>
              <div className="text-xs text-blue-700">Assign & modify roles</div>
            </button>
            <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-blue-900">Institution Control</div>
              <div className="text-xs text-blue-700">247 institutions</div>
            </button>
          </div>
        </div>

        {/* Content & Course Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Content Control
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-green-900">Course Approval</div>
              <div className="text-xs text-green-700">8 pending approvals</div>
            </button>
            <button className="w-full bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-green-900">Content Moderation</div>
              <div className="text-xs text-green-700">Review flagged content</div>
            </button>
            <button className="w-full bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-green-900">Global Announcements</div>
              <div className="text-xs text-green-700">System-wide messaging</div>
            </button>
          </div>
        </div>

        {/* System & Security */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            System Security
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-red-50 hover:bg-red-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-red-900">Security Monitoring</div>
              <div className="text-xs text-red-700">3 active threats</div>
            </button>
            <button className="w-full bg-red-50 hover:bg-red-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-red-900">Access Control</div>
              <div className="text-xs text-red-700">Manage permissions</div>
            </button>
            <button className="w-full bg-red-50 hover:bg-red-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-red-900">Audit Logs</div>
              <div className="text-xs text-red-700">System activity logs</div>
            </button>
          </div>
        </div>

        {/* Analytics & Revenue */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Analytics & Revenue
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-purple-900">Global Analytics</div>
              <div className="text-xs text-purple-700">Cross-platform insights</div>
            </button>
            <button className="w-full bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-purple-900">Revenue Management</div>
              <div className="text-xs text-purple-700">$124,580 this quarter</div>
            </button>
            <button className="w-full bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
              <div className="font-medium text-purple-900">Usage Statistics</div>
              <div className="text-xs text-purple-700">Platform utilization</div>
            </button>
          </div>
        </div>
      </div>

      {/* Learner Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <LearnerInsights />
        </div>
        
        {/* Other admin widgets can go here */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => {
                  window.history.pushState({}, '', '/admin/users');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
              >
                <div className="font-medium text-blue-900">User Management</div>
                <div className="text-sm text-blue-700 mt-1">Manage all system users</div>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                <div className="font-medium text-green-900">System Settings</div>
                <div className="text-sm text-green-700 mt-1">Configure system parameters</div>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
                <div className="font-medium text-purple-900">Reports</div>
                <div className="text-sm text-purple-700 mt-1">Generate system reports</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced System Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health & Performance */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overall Health</span>
              <span className="text-green-600 font-semibold">Excellent</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">99.9%</div>
                <div className="text-xs text-green-700">Uptime</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">0.2s</div>
                <div className="text-xs text-blue-700">Response</div>
              </div>
            </div>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              Emergency System Stop
            </button>
          </div>
        </div>

        {/* Database & Storage Control */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Database Control
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="font-semibold text-gray-900">2.4 TB / 5 TB</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Active Connections</span>
              <span className="font-semibold text-gray-900">1,247</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Query Performance</span>
              <span className="font-semibold text-green-600">Optimal</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="bg-blue-50 text-blue-700 py-2 px-3 rounded text-sm font-medium hover:bg-blue-100">
                Backup Now
              </button>
              <button className="bg-yellow-50 text-yellow-700 py-2 px-3 rounded text-sm font-medium hover:bg-yellow-100">
                Optimize DB
              </button>
            </div>
          </div>
        </div>

        {/* Global Statistics & Licensing */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            Global Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Institutions</span>
              <span className="font-semibold text-gray-900">247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Licenses</span>
              <span className="font-semibold text-gray-900">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Global Users</span>
              <span className="font-semibold text-gray-900">45,892</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <span className="font-semibold text-green-600">$124,580</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data Processed</span>
              <span className="font-semibold text-gray-900">847 GB</span>
            </div>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
              Generate Global Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};