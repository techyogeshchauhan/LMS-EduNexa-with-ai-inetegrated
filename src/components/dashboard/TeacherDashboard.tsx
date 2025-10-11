import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLMS } from '../../contexts/LMSContext';
import { StatsCard } from './StatsCard';
import LearnerInsights from './LearnerInsights';
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Brain,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { courses, assignments, announcements } = useLMS();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock data for teacher-specific metrics
  const teacherStats = [
    { title: 'Active Courses', value: courses.length, icon: BookOpen, color: 'blue' as const, change: '+1 this month' },
    { title: 'Total Students', value: '156', icon: Users, color: 'green' as const, change: '+12 this week' },
    { title: 'Pending Grades', value: '23', icon: FileText, color: 'yellow' as const, change: '5 due today' },
    { title: 'Course Rating', value: '4.8', icon: TrendingUp, color: 'purple' as const, change: '+0.2 this month' }
  ];

  const recentCourses = courses.slice(0, 3);
  const pendingAssignments = assignments.filter(a => a.status === 'submitted').slice(0, 5);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name}! 👨‍🏫
            </h1>
            <p className="text-blue-100 text-lg mb-4">
              Ready to inspire and educate your students?
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{courses.length} Active Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>156 Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>4.8 Rating</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Brain className="h-24 w-24 text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teacherStats.map((stat, index) => (
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Courses and Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
              <div className="flex gap-3">
                <a href="/courses/create" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </a>
                <a href="/courses" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                  View all
                  <Eye className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentCourses.map((course) => (
                <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students} students
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.totalLessons} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Manage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Assignments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pending Grades</h2>
              <a href="/assignments" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View all
              </a>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Submitted by Student • Due: {assignment.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Pending Review
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Grade
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/courses/new" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">Create Course</span>
              </a>
              <a href="/assignments/new" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">New Assignment</span>
              </a>
              <a href="/quizzes/new" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">Create Quiz</span>
              </a>
              <a href="/analytics" className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition-colors">
                <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-yellow-900">View Analytics</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Learner Insights Widget */}
          <LearnerInsights />

          {/* Schedule */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                Today's Schedule
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Machine Learning - Lecture</p>
                    <p className="text-sm text-gray-600">10:00 AM - 11:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Office Hours</p>
                    <p className="text-sm text-gray-600">2:00 PM - 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Python Programming - Lab</p>
                    <p className="text-sm text-gray-600">4:30 PM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
                <a href="/announcements" className="text-blue-600 hover:text-blue-700 text-sm">
                  View all
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{announcement.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Teaching Assistant */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Teaching Assistant</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Generate Quiz</h4>
            <p className="text-sm text-gray-600 mb-3">Create quizzes from your course content</p>
            <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
              Try AI Quiz Generator →
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Student Insights</h4>
            <p className="text-sm text-gray-600 mb-3">Get AI-powered student performance analysis</p>
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
              View Insights →
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Content Suggestions</h4>
            <p className="text-sm text-gray-600 mb-3">Get personalized teaching recommendations</p>
            <button className="text-green-600 text-sm font-medium hover:text-green-700">
              Get Suggestions →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;