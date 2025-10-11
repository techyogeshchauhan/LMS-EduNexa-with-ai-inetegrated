import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Star,
  Play,
  Download,
  FileText,
  Video,
  Link,
  CheckCircle,
  Circle,
  Calendar,
  Award,
  MessageSquare,
  Share2,
  Bookmark,
  MoreVertical,
  Upload,
  Send,
  AlertCircle,
  X
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { getAuthToken } from '../../utils/tokenHelper';
import { Toast } from '../common/Toast';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  materials: {
    id: string;
    title: string;
    type: 'pdf' | 'video' | 'link';
    url: string;
    size?: string;
  }[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  maxPoints: number;
  submittedAt?: string;
  feedback?: string;
}

interface CourseDetailPageProps {
  courseId?: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string, title: string } | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionModal, setSubmissionModal] = useState<{ show: boolean, assignment: Assignment | null }>({ show: false, assignment: null });
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [courseProgress, setCourseProgress] = useState<any>(null);

  // TODO: Fetch real course data from backend
  // For now, showing placeholder until course is selected
  const course = courseData || {
    id: '0',
    title: 'Select a Course',
    description: 'Please select a course from your courses list to view details.',
    instructor: 'N/A',
    instructorAvatar: '',
    rating: 0,
    students: 0,
    duration: 'N/A',
    level: 'Beginner',
    category: 'General',
    progress: 0,
    thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    enrolled: false,
    completedLessons: 0,
    totalLessons: 0,
    lastAccessed: new Date().toISOString(),
    skills: [],
    prerequisites: []
  };

  // No mock modules - will be fetched from backend
  const modules: CourseModule[] = courseData?.modules || [];

  // No mock assignments - will be fetched from backend
  const assignments: Assignment[] = courseData?.assignments || [];

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // If no courseId provided, fetch assignments only
        if (!courseId) {
          const response = await fetch('http://localhost:5000/api/assignments/', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            const transformedAssignments: Assignment[] = data.assignments.map((assignment: any) => ({
              id: assignment._id,
              title: assignment.title,
              description: assignment.description,
              dueDate: assignment.due_date,
              status: assignment.submission_status || 'pending',
              maxPoints: assignment.max_points,
              grade: assignment.submission?.grade,
              submittedAt: assignment.submission?.submitted_at,
              feedback: assignment.submission?.feedback
            }));

            setCourseData({
              ...course,
              assignments: transformedAssignments
            });
          }
          setLoading(false);
          return;
        }

        // Fetch complete course data with modules and materials
        const [courseResponse, progressResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`http://localhost:5000/api/progress/course/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          const course = courseData.course;

          // Get progress data
          let progressData = null;
          if (progressResponse.ok) {
            const progress = await progressResponse.json();
            progressData = progress.progress;
            setCourseProgress(progressData);
          }
          
          // Transform materials to modules
          const completedMaterials = progressData?.materials?.completed_ids || [];
          const transformedModules: CourseModule[] = course.materials?.map((material: any, index: number) => ({
            id: material._id,
            title: material.title,
            description: material.description || `Module ${index + 1}`,
            duration: material.duration || '10 min',
            completed: completedMaterials.includes(material._id),
            type: material.type === 'video' ? 'video' : 'reading',
            materials: [{
              id: material._id,
              title: material.title,
              type: material.type,
              url: material.file_path || material.url,
              size: material.file_size
            }]
          })) || [];

          // Transform assignments
          const transformedAssignments: Assignment[] = course.assignments?.map((assignment: any) => ({
            id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.due_date,
            status: assignment.submission_status || 'pending',
            maxPoints: assignment.max_points,
            grade: assignment.submission?.grade
          })) || [];

          setCourseData({
            id: course._id,
            title: course.title,
            description: course.description,
            instructor: course.teacher_name || 'Unknown',
            instructorAvatar: '',
            rating: 4.5, // TODO: Calculate from reviews
            students: 0, // TODO: Get enrollment count
            duration: course.duration || 'N/A',
            level: course.difficulty || 'Beginner',
            category: course.category,
            progress: progressData?.overall_progress || 0,
            thumbnail: course.thumbnail || 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
            enrolled: true,
            completedLessons: progressData?.materials?.completed || 0,
            totalLessons: transformedModules.length,
            lastAccessed: new Date().toISOString(),
            skills: course.learning_objectives || [],
            prerequisites: course.prerequisites || [],
            modules: transformedModules,
            assignments: transformedAssignments
          });
        } else {
          console.error('Failed to fetch course data');
          setCourseData({
            ...course,
            modules: [],
            assignments: []
          });
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        setCourseData({
          ...course,
          modules: [],
          assignments: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'graded': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSubmitAssignment = async (assignment: Assignment) => {
    // Validation checks
    if (!submissionText.trim() && !submissionFile) {
      setToast({ type: 'error', message: 'Please provide either text content or upload a file' });
      return;
    }

    // Check if assignment is past due
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    if (now > dueDate) {
      setToast({ type: 'error', message: 'Assignment deadline has passed' });
      return;
    }

    // Check file size if file is selected (max 10MB)
    if (submissionFile && submissionFile.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'File size must be less than 10MB' });
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please login to submit assignment');
        return;
      }

      const submissionData: any = {
        text_content: submissionText.trim()
      };

      // Handle file upload if present
      if (submissionFile) {
        // For now, we'll just store the file name
        // In a real implementation, you'd upload the file to a server first
        submissionData.file_name = submissionFile.name;
        submissionData.file_path = `/uploads/${submissionFile.name}`;
      }

      const response = await fetch(`http://localhost:5000/api/assignments/${assignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        setToast({ type: 'success', message: 'Assignment submitted successfully!' });
        
        // Update assignment status in local state
        setCourseData((prevData: any) => ({
          ...prevData,
          assignments: prevData.assignments.map((a: Assignment) => 
            a.id === assignment.id 
              ? { ...a, status: 'submitted' as const, submittedAt: new Date().toISOString() }
              : a
          )
        }));
        
        // Reset form
        setSubmissionText('');
        setSubmissionFile(null);
        setSubmissionModal({ show: false, assignment: null });
      } else {
        // Show error message
        setToast({ type: 'error', message: data.error || 'Failed to submit assignment' });
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setToast({ type: 'error', message: 'Failed to submit assignment. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmissionModal = (assignment: Assignment) => {
    setSubmissionModal({ show: true, assignment });
    setSubmissionText('');
    setSubmissionFile(null);
  };

  const markMaterialComplete = async (materialId: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/progress/material/${materialId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setCourseData((prevData: any) => ({
          ...prevData,
          modules: prevData.modules?.map((module: CourseModule) => 
            module.id === materialId 
              ? { ...module, completed: true }
              : module
          ) || []
        }));

        // Update progress
        if (courseProgress) {
          const newCompletedCount = courseProgress.materials.completed + 1;
          const newProgress = (newCompletedCount / courseProgress.materials.total) * 100;
          
          setCourseProgress({
            ...courseProgress,
            overall_progress: newProgress,
            materials: {
              ...courseProgress.materials,
              completed: newCompletedCount,
              completed_ids: [...courseProgress.materials.completed_ids, materialId]
            }
          });

          setCourseData((prevData: any) => ({
            ...prevData,
            progress: newProgress,
            completedLessons: newCompletedCount
          }));
        }

        setToast({ type: 'success', message: 'Material marked as complete!' });
      }
    } catch (error) {
      console.error('Failed to mark material as complete:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Course Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Progress</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{course.progress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Completed</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{course.completedLessons}/{course.totalLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Duration</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{course.duration}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Level</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{course.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">About This Course</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">{course.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">Skills You'll Learn</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {course.skills.map((skill: string, index: number) => (
                <span key={index} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">Prerequisites</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {course.prerequisites.map((prereq: string, index: number) => (
                <span key={index} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModules = () => (
    <div className="space-y-3 sm:space-y-4">
      {modules.map((module) => (
        <div key={module.id} className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${module.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {module.completed ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">{module.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{module.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{module.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {module.completed ? (
                  <button className="bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial justify-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                  </button>
                ) : (
                  <>
                    <button className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial justify-center">
                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      Start
                    </button>
                    <button
                      onClick={() => markMaterialComplete(module.id)}
                      className="bg-gray-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                      title="Mark as complete"
                    >
                      ✓
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {selectedModule === module.id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Course Materials</h4>
                <div className="space-y-3">
                  {module.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        {material.type === 'video' && <Video className="h-4 w-4 text-blue-600" />}
                        {material.type === 'pdf' && <FileText className="h-4 w-4 text-red-600" />}
                        {material.type === 'link' && <Link className="h-4 w-4 text-green-600" />}
                        <div>
                          <p className="font-medium text-gray-900">{material.title}</p>
                          {material.size && <p className="text-sm text-gray-500">{material.size}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {material.type === 'video' && (
                          <button
                            onClick={() => setSelectedVideo({ id: material.id, title: material.title })}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Play className="h-3 w-3" />
                            Play
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-3 sm:space-y-4">
      {assignments.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
          <p className="text-sm sm:text-base text-gray-600">No assignments available for this course yet.</p>
        </div>
      ) : (
        assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className={`flex items-center gap-1 ${
                    new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 
                    new Date(assignment.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'text-orange-600' : 
                    'text-gray-500'
                  }`}>
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDate(assignment.dueDate)}</span>
                    {new Date(assignment.dueDate) < new Date() && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-2">
                        Overdue
                      </span>
                    )}
                    {new Date(assignment.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) && 
                     new Date(assignment.dueDate) > new Date() && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-2">
                        Due Soon
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{assignment.maxPoints} points</span>
                  </div>
                  {assignment.submittedAt && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Submitted: {formatDate(assignment.submittedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize ${getStatusColor(assignment.status)}`}>
                  {assignment.status === 'pending' ? (
                    <span className="flex items-center gap-1">
                      <Circle className="h-3 w-3" />
                      Not Submitted
                    </span>
                  ) : assignment.status === 'submitted' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Submitted
                    </span>
                  ) : assignment.status === 'graded' ? (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Graded
                    </span>
                  ) : assignment.status}
                </span>
                {assignment.grade !== undefined && (
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{assignment.grade}/{assignment.maxPoints}</p>
                    <p className="text-sm text-gray-500">Grade</p>
                  </div>
                )}
                {assignment.status === 'pending' ? (
                  new Date(assignment.dueDate) < new Date() ? (
                    <button 
                      disabled
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center gap-2"
                      title="Assignment deadline has passed"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Overdue
                    </button>
                  ) : (
                    <button 
                      onClick={() => openSubmissionModal(assignment)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Submit
                    </button>
                  )
                ) : (
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    View
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'modules', label: 'Modules', icon: Play },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare }
  ];

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Courses</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full sm:w-32 h-48 sm:h-24 object-cover rounded-lg"
          />

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">by {course.instructor}</p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{course.students.toLocaleString()} students</span>
                    <span className="sm:hidden">{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
                <span>Course Progress</span>
                <span>{course.progress}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 sm:mb-8 -mx-3 sm:mx-0 px-3 sm:px-0">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'modules' && renderModules()}
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'discussions' && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Course Discussions</h3>
            <p className="text-gray-600">Connect with fellow students and instructors</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
          onComplete={() => markMaterialComplete(selectedVideo.id)}
        />
      )}

      {/* Assignment Submission Modal */}
      {submissionModal.show && submissionModal.assignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Submit Assignment</h2>
                <button
                  onClick={() => setSubmissionModal({ show: false, assignment: null })}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-2">{submissionModal.assignment.title}</p>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Assignment Details */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Assignment Details</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">{submissionModal.assignment.description}</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Due: {formatDate(submissionModal.assignment.dueDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{submissionModal.assignment.maxPoints} points</span>
                  </div>
                </div>
              </div>

              {/* Text Submission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Submission
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your assignment text here..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Upload (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (10MB limit)
                        if (file.size > 10 * 1024 * 1024) {
                          setToast({ type: 'error', message: 'File size must be less than 10MB' });
                          e.target.value = '';
                          return;
                        }
                        
                        // Check file type
                        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png'];
                        if (!allowedTypes.includes(file.type)) {
                          setToast({ type: 'error', message: 'Please upload a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)' });
                          e.target.value = '';
                          return;
                        }
                        
                        setSubmissionFile(file);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {submissionFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-gray-900 font-medium">{submissionFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(submissionFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSubmissionFile(null);
                            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload a file</p>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important</p>
                  <p className="text-sm text-yellow-700">
                    Once submitted, you cannot modify your assignment. Please review your work before submitting.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSubmissionModal({ show: false, assignment: null })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitAssignment(submissionModal.assignment!)}
                disabled={submitting || (!submissionText.trim() && !submissionFile)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};