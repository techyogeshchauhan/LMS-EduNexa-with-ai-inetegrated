import React, { createContext, useContext, useState } from 'react';

interface Course {
  createdAt: number;
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real courses from backend
  React.useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend format
        const transformedCourses = data.courses?.map((course: any) => ({
          id: course._id || course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor || 'Instructor',
          progress: course.progress || 0,
          totalLessons: course.total_lessons || course.modules?.length || 0,
          completedLessons: course.completed_lessons || 0,
          thumbnail: course.thumbnail || 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: course.category,
          difficulty: course.difficulty || 'Beginner',
          rating: course.rating || 4.5,
          students: course.students || 0,
          createdAt: course.created_at,
          duration: course.duration
        })) || [];
        setCourses(transformedCourses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // No mock data - use only real data from backend

  // No mock assignments - fetch from backend when needed
  const assignments: Assignment[] = [];

  // No mock announcements - fetch from backend when needed
  const announcements: Announcement[] = [];

  // Use only real courses from backend
  const displayCourses = courses;

  return (
    <LMSContext.Provider value={{
      courses: displayCourses,
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