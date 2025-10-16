import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dashboard } from '../dashboard/Dashboard';
import { CoursesPage } from '../courses/CoursesPage';
import { CreateCoursePage } from '../courses/CreateCoursePage';
import { AssignmentsPage } from '../assignments/AssignmentsPage';
import { DiscussionsPage } from '../discussions/DiscussionsPage';
import { AnalyticsPage } from '../analytics/AnalyticsPage';
import { AIAssistant } from '../ai/AIAssistant';
import { ProfilePage } from '../profile/ProfilePage';
import { SettingsPage } from '../settings/SettingsPage';
import { Notifications } from '../../pages/Notifications';
import { MessagesPage } from '../messages/MessagesPage';
import { AchievementsPage } from '../achievements/AchievementsPage';
import { StudentsPage } from '../students/StudentsPage';
import { SchedulePage } from '../schedule/SchedulePage';
import { CourseDetailPage } from '../courses/CourseDetailPage';
import { AssignmentDetailPage } from '../assignments/AssignmentDetailPage';
import { QuizDetailPage } from '../quizzes/QuizDetailPage';
import LearnerAnalytics from '../analytics/LearnerAnalytics';
import UserManagement from '../admin/UserManagement';
import { VideoManagement } from '../../pages/VideoManagement';
import { AssignmentTest } from '../test/AssignmentTest';
import { TeacherAssignmentView } from '../assignments/TeacherAssignmentView';
import { QuickTest } from '../test/QuickTest';

export const AppRouter: React.FC = () => {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = React.useState('/dashboard');

  // Simple router based on current path
  React.useEffect(() => {
    const path = window.location.pathname;
    setCurrentPath(path === '/' ? '/dashboard' : path);

    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath === '/' ? '/dashboard' : newPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    // Handle dynamic routes
    if (currentPath.startsWith('/courses/') && currentPath !== '/courses/create') {
      const courseId = currentPath.split('/')[2];
      return <CourseDetailPage courseId={courseId} />;
    }

    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />;
      case '/courses':
        return <CoursesPage />;
      case '/courses/create':
        return <CreateCoursePage />;
      case '/videos':
        return <VideoManagement />;
      case '/assignments':
        return <AssignmentsPage />;
      case '/discussions':
        return <DiscussionsPage />;
      case '/analytics':
        return <AnalyticsPage />;
      case '/analytics/learners':
        return <LearnerAnalytics />;
      case '/admin/users':
        return <UserManagement />;
      case '/ai-assistant':
        return <AIAssistant />;
      case '/profile':
        return <ProfilePage />;
      case '/settings':
        return <SettingsPage />;
      case '/notifications':
        return <Notifications />;
      case '/messages':
        return <MessagesPage />;
      case '/achievements':
        return <AchievementsPage />;
      case '/students':
        return <StudentsPage />;
      case '/schedule':
        return <SchedulePage />;
      case '/courses/detail':
        return <CourseDetailPage />;
      case '/test/assignments':
        return <AssignmentTest />;
      case '/test':
        return <QuickTest />;
      case '/assignments/detail':
        return <AssignmentDetailPage />;
      case '/quizzes/detail':
        return <QuizDetailPage />;
      default:
        return <Dashboard />;
    }
  };

  // Add click handlers to navigation links
  React.useEffect(() => {
    const handleNavigation = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = target.pathname;
        setCurrentPath(path);
        window.history.pushState({}, '', path);
      }
    };

    document.addEventListener('click', handleNavigation);
    return () => document.removeEventListener('click', handleNavigation);
  }, []);

  return renderPage();
};