import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'super_admin':
      return <SuperAdminDashboard />;
    default:
      return <StudentDashboard />; // Default fallback
  }
};