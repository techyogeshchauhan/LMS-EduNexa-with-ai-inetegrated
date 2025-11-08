import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLMS } from '../../contexts/LMSContext';
import { StatsCard } from './StatsCard';
import LearnerInsights from './LearnerInsights';
import TeacherAPI from '../../services/teacherAPI';
import { AssignmentAPI } from '../../services/assignmentAPI';
import { TeacherStats, TeacherCourse } from '../../types/teacher';
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Brain,
  Calendar,
  Award,
  AlertTriangle,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  course_title: string;
  due_date: string;
  status: string;
  submission_count?: number;
}

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { announcements } = useLMS();
  
  // State for real data
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch all dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch data in parallel
      const [statsData, coursesData, assignmentsData] = await Promise.all([
        TeacherAPI.getDashboardStats(),
        TeacherAPI.getCourses(),
        AssignmentAPI.getAssignments()
      ]);

      setTeacherStats(statsData);
      setCourses(coursesData);
      
      // Filter pending assignments (submitted but not graded)
      const pending = assignmentsData
        .filter((a: Assignment) => a.submission_count && a.submission_count > 0)
        .slice(0, 5);
      setPendingAssignments(pending);

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-2xl p-8 text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !teacherStats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const recentCourses = courses.slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 3);

  // Stats cards data
  const statsCards = teacherStats ? [
    { 
      title: 'Active Courses', 
      value: teacherStats.active_courses, 
      icon: BookOpen, 
      color: 'blue' as const, 
      change: teacherStats.monthly_growth.courses > 0 
        ? `+${teacherStats.monthly_growth.courses} this month` 
        : 'No change this month'
    },
    { 
      title: 'Total Students', 
      value: teacherStats.total_students.toString(), 
      icon: Users, 
      color: 'green' as const, 
      change: teacherStats.monthly_growth.students > 0 
        ? `+${teacherStats.monthly_growth.students} this month` 
        : 'No change this month'
    },
    { 
      title: 'Pending Grades', 
      value: teacherStats.pending_grades.toString(), 
      icon: FileText, 
      color: 'yellow' as const, 
      change: teacherStats.pending_grades > 0 
        ? `${teacherStats.pending_grades} need review` 
        : 'All caught up!'
    },
    { 
      title: 'Course Rating', 
      value: teacherStats.course_rating.toFixed(1), 
      icon: TrendingUp, 
      color: 'purple' as const, 
      change: teacherStats.monthly_growth.rating_change !== 0
        ? `${teacherStats.monthly_growth.rating_change > 0 ? '+' : ''}${teacherStats.monthly_growth.rating_change.toFixed(1)} this month`
        : 'No change this month'
    }
  ] : [];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {user?.name}! 👨‍🏫
              </h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh dashboard"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-blue-100 text-lg mb-4">
              Ready to inspire and educate your students?
            </p>
            {teacherStats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{teacherStats.active_courses} Active Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{teacherStats.total_students} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{teacherStats.course_rating.toFixed(1)} Rating</span>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <Brain className="h-24 w-24 text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
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
            {recentCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentCourses.map((course) => (
                  <div key={course._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.enrolled_students} students
                          </span>
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {course.total_assignments} assignments
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${course.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className={`text-sm font-medium ${course.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <a 
                        href={`/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Manage →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                <p className="text-gray-600 mb-4">Create your first course to get started</p>
                <a 
                  href="/courses/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </a>
              </div>
            )}
          </div>

          {/* Pending Assignments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pending Grades</h2>
              <a href="/assignments/teacher" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View all
              </a>
            </div>
            {pendingAssignments.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {pendingAssignments.map((assignment) => (
                    <div key={assignment._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.course_title} • {assignment.submission_count || 0} submissions
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Pending Review
                          </span>
                          <a href="/assignments/teacher" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Grade
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No pending assignments to grade</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/courses/create" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">Create Course</span>
              </a>
              <a href="/assignments/teacher" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">New Assignment</span>
              </a>
              <a href="/assignments/teacher" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">Grade Assignments</span>
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
              {recentAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                      <p className="text-xs text-gray-500 mt-2">{announcement.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center">No recent announcements</p>
              )}
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
            <h4 className="font-medium text-gray-900 mb-2">Student Insights</h4>
            <p className="text-sm text-gray-600 mb-3">Get AI-powered student performance analysis</p>
            <a 
              href="/analytics/learners"
              className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
            >
              View Insights →
            </a>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Content Suggestions</h4>
            <p className="text-sm text-gray-600 mb-3">Get personalized teaching recommendations</p>
            <a 
              href="/ai-assistant"
              className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
            >
              Get Suggestions →
            </a>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">AI Chat Assistant</h4>
            <p className="text-sm text-gray-600 mb-3">Ask questions about teaching strategies</p>
            <a 
              href="/ai-assistant"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              Start Chat →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
