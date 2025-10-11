import React from 'react';
import { StudentSidebar } from './StudentSidebar';
import { TeacherSidebar } from './TeacherSidebar';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { Header } from './Header';
import { useLMS } from '../../contexts/LMSContext';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useLMS();
  const { user } = useAuth();

  const renderSidebar = () => {
    switch (user?.role) {
      case 'student':
        return <StudentSidebar />;
      case 'teacher':
        return <TeacherSidebar />;
      case 'super_admin':
        return <SuperAdminSidebar />;
      default:
        return <StudentSidebar />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderSidebar()}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        <Header />
        <main className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
};