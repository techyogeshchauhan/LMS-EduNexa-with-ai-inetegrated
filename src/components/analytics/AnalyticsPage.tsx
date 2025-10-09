import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  BookOpen
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  const learningData = {
    weeklyProgress: [
      { day: 'Mon', hours: 2.5, completed: 3 },
      { day: 'Tue', hours: 3.2, completed: 4 },
      { day: 'Wed', hours: 1.8, completed: 2 },
      { day: 'Thu', hours: 4.1, completed: 5 },
      { day: 'Fri', hours: 2.9, completed: 3 },
      { day: 'Sat', hours: 3.5, completed: 4 },
      { day: 'Sun', hours: 2.1, completed: 2 }
    ],
    subjectPerformance: [
      { subject: 'Machine Learning', progress: 85, grade: 'A-' },
      { subject: 'Python Programming', progress: 72, grade: 'B+' },
      { subject: 'Data Science', progress: 94, grade: 'A' },
      { subject: 'Statistics', progress: 68, grade: 'B' }
    ]
  };

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
        <p className="text-gray-600">Track your progress and performance insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Study Time</p>
              <p className="text-2xl font-bold text-gray-900">124.5h</p>
            </div>
          </div>
          <p className="text-sm text-green-600">+12.3h this week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
          </div>
          <p className="text-sm text-green-600">+5% improvement</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">A-</p>
            </div>
          </div>
          <p className="text-sm text-green-600">Maintained</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Learning Streak</p>
              <p className="text-2xl font-bold text-gray-900">15 days</p>
            </div>
          </div>
          <p className="text-sm text-green-600">Personal best!</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Study Hours</h3>
          </div>
          <div className="space-y-4">
            {learningData.weeklyProgress.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 w-8">{day.day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(day.hours / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{day.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Subject Performance</h3>
          </div>
          <div className="space-y-4">
            {learningData.subjectPerformance.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                  <span className="text-sm font-bold text-gray-900">{subject.grade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{subject.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Most Active Day</h4>
            </div>
            <p className="text-lg font-bold text-blue-600">Thursday</p>
            <p className="text-sm text-gray-600">4.1 hours average</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Preferred Subject</h4>
            </div>
            <p className="text-lg font-bold text-green-600">Data Science</p>
            <p className="text-sm text-gray-600">94% completion rate</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-gray-900">Improvement Rate</h4>
            </div>
            <p className="text-lg font-bold text-purple-600">+15%</p>
            <p className="text-sm text-gray-600">vs last month</p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Study Pattern Analysis</h4>
            <p className="text-sm text-gray-600">You perform best during afternoon sessions (2-4 PM). Consider scheduling difficult topics during this time.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Improvement Suggestion</h4>
            <p className="text-sm text-gray-600">Your Python scores could improve by 12% with more hands-on practice. Try coding exercises daily.</p>
          </div>
        </div>
      </div>
    </div>
  );
};