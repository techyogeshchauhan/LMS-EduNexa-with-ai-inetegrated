// Teacher API Service Module
import { apiClient, API_ENDPOINTS } from '../config/api';
import {
  TeacherStats,
  TeacherAnalytics,
  AssignmentStats,
  TeacherCourse,
  TeacherStudent,
  StudentAnalytics,
  TeacherDashboardData
} from '../types/teacher';

export class TeacherAPI {
  /**
   * Get teacher dashboard statistics
   */
  static async getDashboardStats(): Promise<TeacherStats> {
    try {
      const response = await apiClient.get<{ dashboard_stats: TeacherStats }>(
        `${API_ENDPOINTS.ANALYTICS.BASE}/teacher/dashboard`
      );
      return response.dashboard_stats;
    } catch (error) {
      console.error('Failed to fetch teacher dashboard stats:', error);
      throw new Error('Failed to load dashboard statistics');
    }
  }

  /**
   * Get teacher assignment statistics
   */
  static async getAssignmentStats(): Promise<AssignmentStats> {
    try {
      const response = await apiClient.get<{ assignment_stats: AssignmentStats }>(
        `${API_ENDPOINTS.ANALYTICS.BASE}/teacher/assignments`
      );
      return response.assignment_stats;
    } catch (error) {
      console.error('Failed to fetch teacher assignment stats:', error);
      throw new Error('Failed to load assignment statistics');
    }
  }

  /**
   * Get teacher's courses with enhanced statistics
   */
  static async getCourses(): Promise<TeacherCourse[]> {
    try {
      const response = await apiClient.get<{ courses: TeacherCourse[] }>(
        API_ENDPOINTS.COURSES.BASE
      );
      return response.courses;
    } catch (error) {
      console.error('Failed to fetch teacher courses:', error);
      throw new Error('Failed to load courses');
    }
  }

  /**
   * Get students for a specific course
   */
  static async getCourseStudents(courseId: string): Promise<TeacherStudent[]> {
    try {
      const response = await apiClient.get<{ students: TeacherStudent[] }>(
        API_ENDPOINTS.COURSES.STUDENTS(courseId)
      );
      return response.students;
    } catch (error) {
      console.error('Failed to fetch course students:', error);
      throw new Error('Failed to load course students');
    }
  }

  /**
   * Get analytics for a specific student
   */
  static async getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
    try {
      const response = await apiClient.get<{ analytics: StudentAnalytics }>(
        API_ENDPOINTS.ANALYTICS.STUDENT(studentId)
      );
      return response.analytics;
    } catch (error) {
      console.error('Failed to fetch student analytics:', error);
      throw new Error('Failed to load student analytics');
    }
  }

  /**
   * Get analytics for a specific course
   */
  static async getCourseAnalytics(courseId: string): Promise<any> {
    try {
      const response = await apiClient.get<{ analytics: any }>(
        API_ENDPOINTS.ANALYTICS.COURSE(courseId)
      );
      return response.analytics;
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
      throw new Error('Failed to load course analytics');
    }
  }

  /**
   * Get comprehensive teacher dashboard data
   * Combines multiple API calls for complete dashboard view
   */
  static async getDashboardData(): Promise<TeacherDashboardData> {
    try {
      const [stats, courses, assignmentStats] = await Promise.all([
        this.getDashboardStats(),
        this.getCourses(),
        this.getAssignmentStats()
      ]);

      // Get recent activities from general analytics
      let recent_activities: any[] = [];
      try {
        const analyticsResponse = await apiClient.get<{ analytics: any }>(
          API_ENDPOINTS.ANALYTICS.DASHBOARD
        );
        recent_activities = analyticsResponse.analytics.recent_activities || [];
      } catch (error) {
        console.warn('Failed to fetch recent activities:', error);
        recent_activities = [];
      }

      return {
        stats,
        courses,
        recent_activities,
        assignment_stats: assignmentStats
      };
    } catch (error) {
      console.error('Failed to fetch teacher dashboard data:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  /**
   * Get all students across teacher's courses
   */
  static async getAllStudents(): Promise<TeacherStudent[]> {
    try {
      const courses = await this.getCourses();
      const allStudents: TeacherStudent[] = [];
      const studentIds = new Set<string>();

      // Get students from all courses and deduplicate
      for (const course of courses) {
        try {
          const courseStudents = await this.getCourseStudents(course._id);
          courseStudents.forEach(student => {
            if (!studentIds.has(student.id)) {
              studentIds.add(student.id);
              allStudents.push(student);
            }
          });
        } catch (error) {
          console.warn(`Failed to fetch students for course ${course.title}:`, error);
        }
      }

      return allStudents;
    } catch (error) {
      console.error('Failed to fetch all students:', error);
      throw new Error('Failed to load students');
    }
  }

  /**
   * Get teacher analytics overview
   */
  static async getAnalytics(): Promise<TeacherAnalytics> {
    try {
      const dashboard_stats = await this.getDashboardStats();
      return { dashboard_stats };
    } catch (error) {
      console.error('Failed to fetch teacher analytics:', error);
      throw new Error('Failed to load analytics');
    }
  }
}

export default TeacherAPI;