import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Video,
  Link as LinkIcon
} from 'lucide-react';
import { getAuthToken, isTokenValid, isTeacher } from '../../utils/tokenHelper';

export const CreateCoursePage: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState<{[key: string]: number}>({});

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const goBack = () => {
    window.history.back();
  };

  // Course basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [maxStudents, setMaxStudents] = useState('50');

  // Course details
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [syllabus, setSyllabus] = useState('');

  // Course materials/modules
  const [modules, setModules] = useState<Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: 'video' | 'document' | 'quiz' | 'assignment';
      content: string; // URL or content
      duration: string; // e.g., "15 min"
      order: number;
      isCompleted?: boolean;
    }>;
  }>>([{
    id: '1',
    title: 'Module 1',
    description: '',
    order: 1,
    lessons: []
  }]);

  const categories = [
    'AI & Machine Learning',
    'Programming',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Database',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps',
    'Other'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleAddPrerequisite = () => {
    setPrerequisites([...prerequisites, '']);
  };

  const handleRemovePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const handlePrerequisiteChange = (index: number, value: string) => {
    const updated = [...prerequisites];
    updated[index] = value;
    setPrerequisites(updated);
  };

  const handleAddObjective = () => {
    setLearningObjectives([...learningObjectives, '']);
  };

  const handleRemoveObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const updated = [...learningObjectives];
    updated[index] = value;
    setLearningObjectives(updated);
  };

  const handleAddModule = () => {
    const newModule = {
      id: Date.now().toString(),
      title: `Module ${modules.length + 1}`,
      description: '',
      order: modules.length + 1,
      lessons: []
    };
    setModules([...modules, newModule]);
  };

  const handleRemoveModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const handleModuleChange = (moduleId: string, field: string, value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, [field]: value } : m
    ));
  };

  const handleAddLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const newLesson = {
          id: Date.now().toString(),
          title: `Lesson ${m.lessons.length + 1}`,
          type: 'video' as const,
          content: '',
          duration: '',
          order: m.lessons.length + 1
        };
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
  };

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
  };

  const handleLessonChange = (moduleId: string, lessonId: string, field: string, value: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l =>
            l.id === lessonId ? { ...l, [field]: value } : l
          )
        };
      }
      return m;
    }));
  };

  const handleVideoUpload = async (moduleId: string, lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file size must be less than 100MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    const uploadKey = `${moduleId}-${lessonId}`;
    const lessonTitle = modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId)?.title || 'Video';
    
    // Get token - check both possible names
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      alert('Please login first. Token not found.');
      return;
    }

    console.log('🔑 Uploading video with token:', token.substring(0, 20) + '...');
    console.log('📤 To:', 'http://localhost:5000/api/videos/upload');

    // Create FormData
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', lessonTitle);
    formData.append('description', `Video for ${lessonTitle}`);

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadingVideos(prev => ({ ...prev, [uploadKey]: percentComplete }));
        handleLessonChange(moduleId, lessonId, 'content', `Uploading... ${percentComplete}%`);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        try {
          const data = JSON.parse(xhr.responseText);
          handleLessonChange(moduleId, lessonId, 'content', data.videoId);
          setUploadingVideos(prev => {
            const newState = { ...prev };
            delete newState[uploadKey];
            return newState;
          });
          alert('Video uploaded successfully!');
        } catch (err) {
          alert('Upload completed but failed to parse response');
          handleLessonChange(moduleId, lessonId, 'content', '');
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          alert(`Upload failed: ${errorData.error || xhr.status}`);
        } catch {
          alert(`Upload failed with status ${xhr.status}`);
        }
        handleLessonChange(moduleId, lessonId, 'content', '');
        setUploadingVideos(prev => {
          const newState = { ...prev };
          delete newState[uploadKey];
          return newState;
        });
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      alert('Network error. Please check your connection.');
      handleLessonChange(moduleId, lessonId, 'content', '');
      setUploadingVideos(prev => {
        const newState = { ...prev };
        delete newState[uploadKey];
        return newState;
      });
    });

    // Open connection and send
    xhr.open('POST', 'http://localhost:5000/api/videos/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      alert('Please enter a course title');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a course description');
      return;
    }
    if (!category) {
      alert('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      // Import API
      const { apiClient, API_ENDPOINTS } = await import('../../config/api');

      const courseData = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        duration: duration.trim(),
        thumbnail: thumbnail || 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
        is_public: isPublic,
        max_students: parseInt(maxStudents) || 50,
        prerequisites: prerequisites.filter(p => p.trim()),
        learning_objectives: learningObjectives.filter(o => o.trim()),
        syllabus: syllabus.trim(),
        modules: modules.map(m => ({
          ...m,
          lessons: m.lessons.filter(l => l.title.trim() && l.content.trim())
        })).filter(m => m.title.trim()),
        teacher_id: user?._id
      };

      await apiClient.post(API_ENDPOINTS.COURSES.BASE, courseData);
      
      alert('Course created successfully!');
      navigate('/courses');
    } catch (error: any) {
      console.error('Error creating course:', error);
      alert(`Failed to create course: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
        <p className="text-gray-600">Fill in the details to create your course</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Machine Learning"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your course..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 8 weeks, 40 hours"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make this course publicly visible
              </label>
            </div>
          </div>
        </div>

        {/* Course Thumbnail */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Thumbnail</h2>
          
          <div className="space-y-4">
            {thumbnail ? (
              <div className="relative">
                <img
                  src={thumbnail}
                  alt="Course thumbnail"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setThumbnail('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload a course thumbnail</p>
                <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Recommended: 1200x600px, Max 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Prerequisites</h2>
            <button
              type="button"
              onClick={handleAddPrerequisite}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Prerequisite
            </button>
          </div>

          <div className="space-y-3">
            {prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={prereq}
                  onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                  placeholder="e.g., Basic Python knowledge"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {prerequisites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePrerequisite(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Learning Objectives</h2>
            <button
              type="button"
              onClick={handleAddObjective}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Objective
            </button>
          </div>

          <div className="space-y-3">
            {learningObjectives.map((objective, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder="e.g., Understand machine learning algorithms"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {learningObjectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Syllabus</h2>
          
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            placeholder="Provide a detailed syllabus or course outline..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Course Modules & Lessons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Course Modules & Lessons</h2>
              <p className="text-sm text-gray-600 mt-1">Organize your course content into modules and lessons</p>
            </div>
            <button
              type="button"
              onClick={handleAddModule}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          </div>

          <div className="space-y-6">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                {/* Module Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => handleModuleChange(module.id, 'title', e.target.value)}
                      placeholder="Module title"
                      className="w-full px-4 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    <textarea
                      value={module.description}
                      onChange={(e) => handleModuleChange(module.id, 'description', e.target.value)}
                      placeholder="Module description (optional)"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(module.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                      title="Remove Module"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Lessons */}
                <div className="space-y-3 mb-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2">
                          <select
                            value={lesson.type}
                            onChange={(e) => handleLessonChange(module.id, lesson.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="video">📹 Video</option>
                            <option value="document">📄 Document</option>
                            <option value="quiz">❓ Quiz</option>
                            <option value="assignment">📝 Assignment</option>
                          </select>
                        </div>
                        
                        <div className="md:col-span-4">
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(module.id, lesson.id, 'title', e.target.value)}
                            placeholder="Lesson title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={lesson.duration}
                            onChange={(e) => handleLessonChange(module.id, lesson.id, 'duration', e.target.value)}
                            placeholder="Duration (e.g., 15 min)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="md:col-span-3">
                          {lesson.type === 'video' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 cursor-pointer text-sm">
                                  <Upload className="h-4 w-4" />
                                  {lesson.content && !lesson.content.includes('Uploading') ? 'Change Video' : 'Upload Video'}
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleVideoUpload(module.id, lesson.id, e)}
                                    className="hidden"
                                    disabled={uploadingVideos[`${module.id}-${lesson.id}`] !== undefined}
                                  />
                                </label>
                                {lesson.content && !lesson.content.includes('Uploading') && (
                                  <Video className="h-5 w-5 text-green-600" title="Video uploaded" />
                                )}
                              </div>
                              {uploadingVideos[`${module.id}-${lesson.id}`] !== undefined && (
                                <div className="w-full">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadingVideos[`${module.id}-${lesson.id}`]}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${uploadingVideos[`${module.id}-${lesson.id}`]}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <input
                              type="url"
                              value={lesson.content}
                              onChange={(e) => handleLessonChange(module.id, lesson.id, 'content', e.target.value)}
                              placeholder="URL or content"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>

                        <div className="md:col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(module.id, lesson.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove Lesson"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddLesson(module.id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Lesson to {module.title}
                </button>
              </div>
            ))}
            
            {modules.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No modules added yet</p>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
