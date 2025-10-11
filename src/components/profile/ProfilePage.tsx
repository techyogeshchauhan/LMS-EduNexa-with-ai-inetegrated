import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield,
  Award,
  BookOpen,
  Clock,
  TrendingUp
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profile_pic || '');
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    year: user?.year || '',
    semester: user?.semester || '',
    roll_number: user?.roll_number || '',
    designation: (user as any)?.designation || '',
    location: 'New York, NY',
    bio: 'Passionate learner focused on AI and Machine Learning. Always eager to explore new technologies and share knowledge with the community.',
    website: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe'
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Import the authAPI
      const { authAPI } = await import('../../config/api');
      
      // Prepare update data based on role
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        profile_pic: profilePic
      };

      // Add role-specific fields
      if (user?.role === 'student') {
        updateData.department = formData.department;
        updateData.year = formData.year;
        updateData.semester = formData.semester;
      } else if (user?.role === 'teacher') {
        updateData.department = formData.department;
        updateData.designation = formData.designation;
      }
      
      // Call API to update profile
      await authAPI.updateProfile(updateData);

      await refreshUser();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      year: user?.year || '',
      semester: user?.semester || '',
      roll_number: user?.roll_number || '',
      designation: (user as any)?.designation || '',
      location: 'New York, NY',
      bio: 'Passionate learner focused on AI and Machine Learning. Always eager to explore new technologies and share knowledge with the community.',
      website: 'https://johndoe.dev',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe'
    });
    setProfilePic(user?.profile_pic || '');
    setIsEditing(false);
  };

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setIsUploadingPic(true);
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setProfilePic(base64String);
        setIsUploadingPic(false);
      };
      reader.onerror = () => {
        alert('Failed to read file');
        setIsUploadingPic(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePic = () => {
    setProfilePic('');
  };

  const stats = [
    { label: 'Courses Completed', value: '12', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Study Hours', value: '156', icon: Clock, color: 'text-green-600' },
    { label: 'Certificates', value: '8', icon: Award, color: 'text-purple-600' },
    { label: 'Streak Days', value: '23', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const achievements = [
    { title: 'First Course Completed', description: 'Completed your first course', date: '2024-01-15', icon: '🎓' },
    { title: 'Week Streak', description: 'Studied for 7 consecutive days', date: '2024-01-20', icon: '🔥' },
    { title: 'Quiz Master', description: 'Scored 100% on 5 quizzes', date: '2024-01-25', icon: '🏆' },
    { title: 'AI Enthusiast', description: 'Completed 3 AI courses', date: '2024-02-01', icon: '🤖' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="absolute bottom-0 right-0">
              <input
                type="file"
                id="profile-pic-upload"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="hidden"
              />
              <label
                htmlFor="profile-pic-upload"
                className="bg-white text-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center"
              >
                {isUploadingPic ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
            </div>
            
            {profilePic && (
              <button
                onClick={removeProfilePic}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                title="Remove profile picture"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-blue-100 mb-4 capitalize">{user?.role}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined January 2024</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Picture Management */}
          {isEditing && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex gap-3">
                    <label
                      htmlFor="profile-pic-edit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {profilePic ? 'Change Picture' : 'Upload Picture'}
                    </label>
                    {profilePic && (
                      <button
                        onClick={removeProfilePic}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="profile-pic-edit"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload a square image (recommended: 400x400px). Max file size: 5MB.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formData.name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-900">{formData.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              {user?.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                    <p className="text-gray-900">{user?.roll_number || formData.roll_number || 'Not provided'}</p>
                    <p className="text-xs text-gray-500">Roll number cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.department || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    {isEditing ? (
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Final Year">Final Year</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{formData.year || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    {isEditing ? (
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="3rd Semester">3rd Semester</option>
                        <option value="4th Semester">4th Semester</option>
                        <option value="5th Semester">5th Semester</option>
                        <option value="6th Semester">6th Semester</option>
                        <option value="7th Semester">7th Semester</option>
                        <option value="8th Semester">8th Semester</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{formData.semester || 'Not provided'}</p>
                    )}
                  </div>
                </>
              )}

              {user?.role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <p className="text-gray-900">{user?.employee_id || 'Not provided'}</p>
                    <p className="text-xs text-gray-500">Employee ID cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.department || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    {isEditing ? (
                      <select
                        value={user?.designation || ''}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Designation</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Professor">Professor</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Senior Lecturer">Senior Lecturer</option>
                        <option value="Visiting Faculty">Visiting Faculty</option>
                        <option value="Guest Lecturer">Guest Lecturer</option>
                        <option value="Department Head">Department Head</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user?.designation || 'Not provided'}</p>
                    )}
                  </div>
                </>
              )}

              {user?.role === 'super_admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <p className="text-gray-900">{user?.employee_id || 'Not provided'}</p>
                    <p className="text-xs text-gray-500">Employee ID cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <p className="text-gray-900">{formData.department || 'System Administration'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    <p className="text-gray-900">{user?.designation || 'Super Administrator'}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{formData.bio}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    {formData.website}
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    LinkedIn Profile
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    GitHub Profile
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">{achievement.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Stats</h2>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Enabled</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Manage
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-900">Completed "Machine Learning Basics"</p>
                <p className="text-gray-500">2 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900">Submitted assignment for Python Course</p>
                <p className="text-gray-500">1 day ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900">Earned "Quiz Master" badge</p>
                <p className="text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};