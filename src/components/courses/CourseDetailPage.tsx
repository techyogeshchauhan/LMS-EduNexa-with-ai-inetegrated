import React, { useState } from 'react';
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
  MoreVertical
} from 'lucide-react';

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
}

export const CourseDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Mock course data
  const course = {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'Learn the fundamentals of machine learning with hands-on projects and real-world applications. This comprehensive course covers supervised and unsupervised learning, neural networks, and practical implementation using Python.',
    instructor: 'Dr. Sarah Johnson',
    instructorAvatar: '',
    rating: 4.8,
    students: 1240,
    duration: '12 weeks',
    level: 'Intermediate',
    category: 'AI & Machine Learning',
    progress: 75,
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
    enrolled: true,
    completedLessons: 9,
    totalLessons: 12,
    lastAccessed: '2024-02-10T14:30:00Z',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'Neural Networks'],
    prerequisites: ['Basic Python', 'Statistics', 'Linear Algebra']
  };

  const modules: CourseModule[] = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      description: 'Overview of ML concepts and applications',
      duration: '45 min',
      completed: true,
      type: 'video',
      materials: [
        { id: '1', title: 'Introduction Video', type: 'video', url: '#', size: '120 MB' },
        { id: '2', title: 'Course Slides', type: 'pdf', url: '#', size: '2.5 MB' },
        { id: '3', title: 'Additional Resources', type: 'link', url: '#' }
      ]
    },
    {
      id: '2',
      title: 'Supervised Learning',
      description: 'Linear regression, classification, and model evaluation',
      duration: '1h 20min',
      completed: true,
      type: 'video',
      materials: [
        { id: '4', title: 'Supervised Learning Video', type: 'video', url: '#', size: '180 MB' },
        { id: '5', title: 'Practice Exercises', type: 'pdf', url: '#', size: '1.8 MB' }
      ]
    },
    {
      id: '3',
      title: 'Neural Networks',
      description: 'Deep learning fundamentals and implementation',
      duration: '1h 45min',
      completed: false,
      type: 'video',
      materials: [
        { id: '6', title: 'Neural Networks Video', type: 'video', url: '#', size: '220 MB' },
        { id: '7', title: 'Code Examples', type: 'pdf', url: '#', size: '3.2 MB' }
      ]
    }
  ];

  const assignments: Assignment[] = [
    {
      id: '1',
      title: 'Linear Regression Project',
      description: 'Implement a linear regression model using Python and scikit-learn',
      dueDate: '2024-02-15T23:59:00Z',
      status: 'pending',
      maxPoints: 100
    },
    {
      id: '2',
      title: 'Classification Challenge',
      description: 'Build a classification model for the provided dataset',
      dueDate: '2024-02-22T23:59:00Z',
      status: 'submitted',
      grade: 92,
      maxPoints: 100
    }
  ];

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

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-xl font-bold text-gray-900">{course.progress}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{course.completedLessons}/{course.totalLessons}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-900">{course.duration}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-xl font-bold text-gray-900">{course.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Course</h3>
        <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Skills You'll Learn</h4>
            <div className="flex flex-wrap gap-2">
              {course.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Prerequisites</h4>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((prereq, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
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
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.id} className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {module.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{module.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {module.completed ? (
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </button>
                ) : (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start
                  </button>
                )}
                <button
                  onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {selectedModule === module.id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Course Materials</h4>
                <div className="space-y-3">
                  {module.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {material.type === 'video' && <Video className="h-4 w-4 text-blue-600" />}
                        {material.type === 'pdf' && <FileText className="h-4 w-4 text-red-600" />}
                        {material.type === 'link' && <Link className="h-4 w-4 text-green-600" />}
                        <div>
                          <p className="font-medium text-gray-900">{material.title}</p>
                          {material.size && <p className="text-sm text-gray-500">{material.size}</p>}
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
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
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{assignment.title}</h3>
              <p className="text-gray-600 mb-3">{assignment.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {formatDate(assignment.dueDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{assignment.maxPoints} points</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(assignment.status)}`}>
                {assignment.status}
              </span>
              {assignment.grade && (
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{assignment.grade}/{assignment.maxPoints}</p>
                  <p className="text-sm text-gray-500">Grade</p>
                </div>
              )}
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                {assignment.status === 'pending' ? 'Submit' : 'View'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'modules', label: 'Modules', icon: Play },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </button>
        
        <div className="flex items-start gap-6">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-32 h-24 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4">by {course.instructor}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
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
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
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
    </div>
  );
};