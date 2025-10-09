import React, { createContext, useContext, useState } from 'react';

interface Course {
  duration: ReactNode;
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  thumbnail: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  description: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

interface LMSContextType {
  courses: Course[];
  assignments: Assignment[];
  announcements: Announcement[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (context === undefined) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Mock data
  const courses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      description: 'Learn the fundamentals of machine learning with hands-on projects',
      instructor: 'Dr. Sarah Johnson',
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'AI & Machine Learning',
      difficulty: 'Intermediate',
      rating: 4.8,
      students: 1240
    },
    {
      id: '2',
      title: 'Advanced Python Programming',
      description: 'Master advanced Python concepts and best practices',
      instructor: 'Prof. Michael Chen',
      progress: 45,
      totalLessons: 15,
      completedLessons: 7,
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Programming',
      difficulty: 'Advanced',
      rating: 4.9,
      students: 892
    },
    {
      id: '3',
      title: 'Data Science Fundamentals',
      description: 'Explore data analysis, visualization, and statistical modeling',
      instructor: 'Dr. Emily Rodriguez',
      progress: 90,
      totalLessons: 10,
      completedLessons: 9,
      thumbnail: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Data Science',
      difficulty: 'Beginner',
      rating: 4.7,
      students: 1580
    }
  ];

  const assignments: Assignment[] = [
    {
      id: '1',
      title: 'Linear Regression Project',
      courseId: '1',
      dueDate: '2024-02-15',
      status: 'pending',
      description: 'Implement a linear regression model using Python and scikit-learn'
    },
    {
      id: '2',
      title: 'Python Code Review',
      courseId: '2',
      dueDate: '2024-02-12',
      status: 'submitted',
      description: 'Review and optimize the provided Python code for performance'
    },
    {
      id: '3',
      title: 'Data Visualization Dashboard',
      courseId: '3',
      dueDate: '2024-02-18',
      status: 'graded',
      grade: 95,
      description: 'Create an interactive dashboard using matplotlib and plotly'
    }
  ];

  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'New AI Study Groups Available',
      content: 'Join our weekly AI study groups every Wednesday at 7 PM EST',
      date: '2024-02-01',
      type: 'info'
    },
    {
      id: '2',
      title: 'Assignment Extension',
      content: 'The Linear Regression project deadline has been extended to February 20th',
      date: '2024-02-03',
      type: 'warning'
    },
    {
      id: '3',
      title: 'Certificate Available',
      content: 'Your Data Science Fundamentals certificate is ready for download!',
      date: '2024-02-05',
      type: 'success'
    }
  ];

  return (
    <LMSContext.Provider value={{
      courses,
      assignments,
      announcements,
      sidebarOpen,
      setSidebarOpen,
      selectedCourse,
      setSelectedCourse
    }}>
      {children}
    </LMSContext.Provider>
  );
};