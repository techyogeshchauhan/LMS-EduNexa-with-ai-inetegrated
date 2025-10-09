import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLMS } from '../../contexts/LMSContext';
import { StatsCard } from './StatsCard';
import { AnnouncementCard } from './AnnouncementCard';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { aiAPI } from '../../config/api';
import {
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Brain,
  Target,
  Calendar,
  Award,
  CheckCircle,
  MessageCircle,
  Play,
  Send,
  X,
  Lightbulb,
  Users
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { courses, assignments, announcements } = useLMS();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai', message: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingLearningPath, setLoadingLearningPath] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Function to fetch AI recommendations
  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      console.log('Fetching AI recommendations...');
      const recData = await aiAPI.getRecommendations().catch((error) => {
        console.error('Failed to fetch recommendations:', error);
        // Return fallback recommendations
        return {
          course_recommendations: [],
          study_tips: [
            "Create a consistent daily study schedule",
            "Use active recall techniques when reviewing material",
            "Take regular breaks to maintain focus and retention",
            "Form study groups with classmates for collaborative learning",
            "Practice with past quizzes and assignments regularly"
          ],
          performance_summary: {
            strong_areas: [],
            weak_areas: [],
            total_points: user?.total_points || 0,
            courses_enrolled: courses.length,
            quizzes_attempted: 0,
            assignments_submitted: 0
          }
        };
      });
      
      console.log('Recommendations received:', recData);
      setRecommendations(recData);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Function to generate learning path
  const generateNewLearningPath = async (customGoal?: string) => {
    setLoadingLearningPath(true);
    try {
      const learningGoal = customGoal || `Complete my current courses, improve in weak areas, and advance my skills in ${user?.department || 'my field of study'}`;
      console.log('Generating learning path with goal:', learningGoal);
      
      const pathData = await aiAPI.generateLearningPath(learningGoal, 'month').catch((error) => {
        console.error('Failed to generate learning path:', error);
        // Return a fallback learning path
        return {
          learning_path: {
            goal: learningGoal,
            timeframe: 'month',
            learning_path: `### 🎯 Month Learning Plan

**Goal:** ${learningGoal}

**Focus Areas:** Complete enrolled courses and strengthen understanding

**Study Time:** 10-15 hours per week

**Action Plan:** Catch up on materials, strengthen weak areas, and practice consistently

**Quick Tips:**
- Set daily study goals and track progress
- Review material regularly using active recall
- Join study groups for collaborative learning
- Take breaks to maintain focus

*Click "New Path" to generate a custom plan for different goals*`
          }
        };
      });
      
      console.log('Learning path received:', pathData);
      setLearningPath(pathData);
      
      // Store in localStorage with timestamp
      localStorage.setItem('learningPath', JSON.stringify(pathData));
      localStorage.setItem('learningPathDate', Date.now().toString());
    } catch (error) {
      console.error('Failed to generate learning path:', error);
    } finally {
      setLoadingLearningPath(false);
    }
  };

  // Fetch AI recommendations and learning path on component mount
  useEffect(() => {
    // Only fetch if user is loaded and is a student
    if (user && user.role === 'student') {
      fetchRecommendations();
      
      // Check if learning path exists in localStorage
      const storedPath = localStorage.getItem('learningPath');
      const storedPathDate = localStorage.getItem('learningPathDate');
      
      // Only generate new path if none exists or it's older than 7 days
      if (!storedPath || !storedPathDate || 
          (Date.now() - parseInt(storedPathDate)) > 7 * 24 * 60 * 60 * 1000) {
        generateNewLearningPath();
      } else {
        // Use stored learning path
        setLearningPath(JSON.parse(storedPath));
      }
    }
  }, [user]);

  // Load welcome message when chat opens
  useEffect(() => {
    if (chatOpen && chatHistory.length === 0) {
      const loadWelcomeMessage = async () => {
        try {
          const welcomeData = await aiAPI.getWelcomeMessage();
          setChatHistory([{ type: 'ai', message: (welcomeData as any).message }]);
        } catch (error) {
          console.error('Failed to load welcome message:', error);
          setChatHistory([{ 
            type: 'ai', 
            message: `## 👋 Hello ${user?.name}!\n\nI'm your AI study assistant. How can I help you with your studies today?` 
          }]);
        }
      };
      loadWelcomeMessage();
    }
  }, [chatOpen, chatHistory.length, user?.name]);

  // Handle AI chat
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsTyping(true);

    try {
      const response = await aiAPI.chat(userMessage);
      setChatHistory(prev => [...prev, { type: 'ai', message: (response as any).response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const upcomingAssignments = assignments.filter(a => new Date(a.dueDate) > new Date()).slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);

  // Mock quiz results data
  const recentQuizResults = [
    { id: '1', title: 'Machine Learning Quiz 1', course: 'Introduction to Machine Learning', score: 85, maxScore: 100, date: '2024-02-08' },
    { id: '2', title: 'Python Basics Test', course: 'Advanced Python Programming', score: 92, maxScore: 100, date: '2024-02-06' },
    { id: '3', title: 'Data Structures Quiz', course: 'Data Science Fundamentals', score: 78, maxScore: 100, date: '2024-02-04' }
  ];

  // Enhanced course data with progress
  const coursesWithProgress = courses.map(course => ({
    ...course,
    progress: course.progress || Math.floor(Math.random() * 100), // Use existing or mock progress
    nextLesson: `Lesson ${Math.floor(course.progress / 10) + 1}`,
    totalLessons: course.totalLessons || 12,
    completedLessons: course.completedLessons || Math.floor((course.progress || 0) / 10)
  }));

  // Helper function to get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  // Helper function to get assignment priority based on due date
  const getAssignmentPriority = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 2) return 'high';
    if (daysUntilDue <= 7) return 'medium';
    return 'low';
  };

  const avgQuizScore = recentQuizResults.length > 0
    ? Math.round(recentQuizResults.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore * 100), 0) / recentQuizResults.length)
    : 0;

  const totalProgress = coursesWithProgress.length > 0
    ? Math.round(coursesWithProgress.reduce((sum, course) => sum + course.progress, 0) / coursesWithProgress.length)
    : 0;

  const statsData = [
    { title: 'Enrolled Courses', value: courses.length.toString(), icon: BookOpen, color: 'blue' as const, change: '+2 this month' },
    { title: 'Average Progress', value: `${totalProgress}%`, icon: TrendingUp, color: 'green' as const, change: '+12% this week' },
    { title: 'Quiz Average', value: `${avgQuizScore}%`, icon: Trophy, color: 'purple' as const, change: '+5% improvement' },
    { title: 'Study Streak', value: '7 days', icon: Calendar, color: 'yellow' as const, change: 'Personal best!' }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg mb-4">
              Ready to continue your learning journey?
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Daily goal: 2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Streak: 7 days</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Level: Intermediate</span>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Courses Section with Progress */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <a href="/courses" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View all courses
            </a>
          </div>
          <div className="space-y-4">
            {coursesWithProgress.slice(0, 3).map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.instructor}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Next: {course.nextLesson}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{course.progress}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{course.completedLessons} of {course.totalLessons} completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${course.progress > 80 ? 'bg-green-500' : course.progress > 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {course.progress > 80 ? 'Almost done!' : course.progress > 50 ? 'Good progress' : 'Just started'}
                    </span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/courses" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">Browse Courses</span>
              </a>
              <a href="/assignments" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
                <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">Assignments</span>
              </a>
              <a href="/ai-assistant" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">AI Assistant</span>
              </a>
              <a href="/achievements" className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition-colors">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-yellow-900">Achievements</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Quiz Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Quiz Results</h3>
              <a href="/quizzes" className="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </a>
            </div>
            <div className="space-y-3">
              {recentQuizResults.map((quiz) => (
                <div key={quiz.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
                      <p className="text-sm text-gray-600">{quiz.course}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.score >= 90 ? 'bg-green-100 text-green-800' :
                        quiz.score >= 75 ? 'bg-blue-100 text-blue-800' :
                          quiz.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                      {Math.round((quiz.score / quiz.maxScore) * 100)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{quiz.score}/{quiz.maxScore} points</span>
                    <span>{new Date(quiz.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
              <a href="/assignments" className="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </a>
            </div>
            <div className="space-y-3">
              {upcomingAssignments.slice(0, 3).map((assignment) => {
                const priority = getAssignmentPriority(assignment.dueDate);
                const courseName = getCourseName(assignment.courseId);
                const dueDate = new Date(assignment.dueDate).toLocaleDateString();

                return (
                  <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{courseName}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-500">Due {dueDate}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${priority === 'high' ? 'bg-red-100 text-red-800' :
                        priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {priority}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
              <a href="/achievements" className="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </a>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Assignment Master</h4>
                    <p className="text-sm text-gray-600">Completed 10 assignments</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Course Completion</h4>
                    <p className="text-sm text-gray-600">Finished Python Basics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
              <a href="/announcements" className="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </a>
            </div>
            <div className="space-y-3">
              {recentAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Learning Path */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Your Personalized Learning Path</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchRecommendations()}
              disabled={loadingRecommendations}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loadingRecommendations ? '🔄 Loading...' : '🔄 Refresh Tips'}
            </button>
            <button
              onClick={() => {
                const learningGoal = prompt('What would you like to focus on in your learning journey?') || 
                  `Improve my skills in ${user?.department || 'my field of study'} and complete current courses`;
                generateNewLearningPath(learningGoal);
              }}
              disabled={loadingLearningPath}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50"
            >
              {loadingLearningPath ? '🔄 Generating...' : '🔄 New Path'}
            </button>
          </div>
        </div>

        {loadingLearningPath ? (
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm text-gray-600">Generating your personalized learning path...</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        ) : learningPath ? (
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">🎯 AI-Generated Study Plan</h4>
              <span className="text-xs text-gray-500">
                Goal: {learningPath.learning_path?.goal || 'Personal Development'}
              </span>
            </div>
            <div className="text-sm text-gray-700 prose prose-sm max-w-none">
              <MarkdownRenderer content={learningPath.learning_path?.learning_path || learningPath.learning_path || 'Loading your personalized learning path...'} />
            </div>
            {learningPath.learning_path?.timeframe && (
              <div className="mt-3 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                📅 Timeframe: {learningPath.learning_path.timeframe}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm text-gray-600">Generating your personalized learning path...</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations ? (
            <>
              {recommendations.course_recommendations && recommendations.course_recommendations.length > 0 ? (
                recommendations.course_recommendations.slice(0, 3).map((course: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2">📚 Recommended Course</h4>
                    <p className="text-sm text-gray-600 mb-2 font-medium">{course.title}</p>
                    <p className="text-xs text-gray-500 mb-3">{course.description?.substring(0, 80)}...</p>
                    <button 
                      onClick={() => window.location.href = '/courses'}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                    >
                      View Course →
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">🎯 Current Focus</h4>
                  <p className="text-sm text-gray-600 mb-3">Complete your enrolled courses and improve your performance</p>
                  <button 
                    onClick={() => window.location.href = '/courses'}
                    className="text-purple-600 text-sm font-medium hover:text-purple-700"
                  >
                    Continue Learning →
                  </button>
                </div>
              )}
              
              {/* Performance Summary Card */}
              {recommendations.performance_summary && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">📊 Your Progress</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Courses:</span>
                      <span className="font-medium">{recommendations.performance_summary.courses_enrolled}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quizzes:</span>
                      <span className="font-medium">{recommendations.performance_summary.quizzes_attempted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Points:</span>
                      <span className="font-medium text-purple-600">{recommendations.performance_summary.total_points}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Strong Areas Card */}
              {recommendations.performance_summary?.strong_areas?.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">💪 Strong Areas</h4>
                  <div className="space-y-1">
                    {recommendations.performance_summary.strong_areas.slice(0, 3).map((area: string, index: number) => (
                      <div key={index} className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                        ✓ {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Study Tips Section */}
        {recommendations?.study_tips && recommendations.study_tips.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              💡 Personalized Study Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.study_tips.slice(0, 4).map((tip: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                  <span className="text-yellow-500 mt-0.5 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {recommendations?.performance_summary?.weak_areas?.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              🎯 Areas for Improvement
            </h4>
            <div className="space-y-2">
              {recommendations.performance_summary.weak_areas.map((area: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                  <span className="text-orange-500">⚠️</span>
                  <span>Focus more on: <strong>{area}</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbot Widget */}
      {chatOpen && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <span className="font-medium">AI Study Assistant</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Loading your personalized welcome message...</p>
              </div>
            )}

            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg text-sm ${chat.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                  }`}>
                  {chat.type === 'ai' ? (
                    <MarkdownRenderer content={chat.message} />
                  ) : (
                    chat.message
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};