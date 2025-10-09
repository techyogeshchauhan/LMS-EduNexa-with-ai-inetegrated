import React, { useState } from 'react';
import { useLMS } from '../../contexts/LMSContext';
import { Search, Filter, Plus, FileText, Calendar, CheckCircle, Clock, Upload, Download, Eye, AlertTriangle, BookOpen, User, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  instructor: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  description: string;
  instructions: string;
  maxPoints: number;
  submissionType: 'file' | 'text' | 'both';
  attachments?: string[];
  submittedAt?: string;
  feedback?: string;
}

export const AssignmentsPage: React.FC = () => {
  const { courses } = useLMS();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);

  // Enhanced mock assignments with more details
  const assignments: Assignment[] = [
    {
      id: '1',
      title: 'Linear Regression Implementation',
      courseId: '1',
      courseName: 'Introduction to Machine Learning',
      instructor: 'Dr. Sarah Johnson',
      dueDate: '2024-02-15T23:59:00',
      status: 'pending',
      description: 'Implement a linear regression model using Python and scikit-learn',
      instructions: `
        <h3>Assignment Instructions:</h3>
        <p>In this assignment, you will implement a linear regression model from scratch and compare it with scikit-learn's implementation.</p>
        
        <h4>Requirements:</h4>
        <ul>
          <li>Implement linear regression using gradient descent</li>
          <li>Use the provided dataset (housing_prices.csv)</li>
          <li>Create visualizations showing the regression line</li>
          <li>Compare your implementation with scikit-learn</li>
          <li>Write a report explaining your findings</li>
        </ul>
        
        <h4>Deliverables:</h4>
        <ul>
          <li>Python notebook (.ipynb file)</li>
          <li>Written report (PDF format)</li>
          <li>Dataset analysis and visualizations</li>
        </ul>
        
        <h4>Grading Criteria:</h4>
        <ul>
          <li>Code implementation (40%)</li>
          <li>Accuracy of results (30%)</li>
          <li>Report quality (20%)</li>
          <li>Code documentation (10%)</li>
        </ul>
      `,
      maxPoints: 100,
      submissionType: 'both',
      attachments: ['housing_prices.csv', 'assignment_template.ipynb']
    },
    {
      id: '2',
      title: 'Python Code Optimization',
      courseId: '2',
      courseName: 'Advanced Python Programming',
      instructor: 'Prof. Michael Chen',
      dueDate: '2024-02-12T23:59:00',
      status: 'submitted',
      submittedAt: '2024-02-10T15:30:00',
      description: 'Review and optimize the provided Python code for performance',
      instructions: `
        <h3>Code Optimization Challenge:</h3>
        <p>You are given a Python script that processes large datasets but runs slowly. Your task is to optimize it for better performance.</p>
        
        <h4>Tasks:</h4>
        <ul>
          <li>Profile the existing code to identify bottlenecks</li>
          <li>Implement optimizations using appropriate data structures</li>
          <li>Use vectorization where possible</li>
          <li>Document your optimization strategies</li>
        </ul>
      `,
      maxPoints: 80,
      submissionType: 'file',
      attachments: ['slow_code.py', 'test_data.csv']
    },
    {
      id: '3',
      title: 'Data Visualization Dashboard',
      courseId: '3',
      courseName: 'Data Science Fundamentals',
      instructor: 'Dr. Emily Rodriguez',
      dueDate: '2024-02-18T23:59:00',
      status: 'graded',
      grade: 95,
      submittedAt: '2024-02-16T14:20:00',
      feedback: 'Excellent work! Your dashboard is well-designed and provides clear insights. The interactive elements work perfectly. Minor suggestion: consider adding more color customization options.',
      description: 'Create an interactive dashboard using matplotlib and plotly',
      instructions: `
        <h3>Dashboard Creation:</h3>
        <p>Build an interactive data visualization dashboard that tells a compelling story with data.</p>
        
        <h4>Requirements:</h4>
        <ul>
          <li>Use at least 3 different chart types</li>
          <li>Include interactive elements</li>
          <li>Provide clear insights and conclusions</li>
          <li>Make it responsive and user-friendly</li>
        </ul>
      `,
      maxPoints: 120,
      submissionType: 'both',
      attachments: ['sample_data.csv']
    }
  ];

  const filteredAssignments = assignments
    .filter(assignment => 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(assignment => filterStatus === 'all' || assignment.status === filterStatus);

  const statusCounts = {
    all: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length
  };

  const handleSubmitAssignment = () => {
    if (!selectedAssignment) return;
    
    // Here you would typically send the submission to the backend
    console.log('Submitting assignment:', {
      assignmentId: selectedAssignment.id,
      text: submissionText,
      files: submissionFiles
    });
    
    // Reset form and close modal
    setSubmissionText('');
    setSubmissionFiles([]);
    setShowSubmissionModal(false);
    setSelectedAssignment(null);
    
    // Show success message (in a real app, you'd update the assignment status)
    alert('Assignment submitted successfully!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSubmissionFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'graded': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
          <p className="text-gray-600">Track and manage your coursework</p>
        </div>
        {user?.role === 'instructor' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Assignment
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Submitted</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.submitted}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Graded</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.graded}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const daysUntilDue = getDaysUntilDue(assignment.dueDate);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

            return (
              <div key={assignment.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment.status)}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                      {isOverdue && assignment.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                          Overdue
                        </span>
                      )}
                      {isDueSoon && assignment.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          Due Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{assignment.courseName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{assignment.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{assignment.description}</p>
                    
                    {assignment.status === 'graded' && assignment.grade && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">Grade: {assignment.grade}/{assignment.maxPoints}</span>
                          </div>
                        </div>
                        {assignment.feedback && (
                          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900"><strong>Feedback:</strong> {assignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {assignment.submittedAt && (
                      <div className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Submitted:</span> {formatDate(assignment.submittedAt)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    
                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-700">
                        <Download className="h-4 w-4" />
                        Download Files ({assignment.attachments.length})
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {assignment.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmissionModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Submit Assignment
                      </button>
                    )}
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{assignment.maxPoints} points</div>
                      {daysUntilDue >= 0 ? (
                        <div className="text-xs text-gray-500">
                          {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
                        </div>
                      ) : (
                        <div className="text-xs text-red-500">
                          {Math.abs(daysUntilDue)} days overdue
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      {/* Assignment Detail Modal */}
      {selectedAssignment && !showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                <p className="text-gray-600">{selectedAssignment.courseName}</p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: selectedAssignment.instructions }} />
                  </div>
                  
                  {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Assignment Files:</h4>
                      <div className="space-y-2">
                        {selectedAssignment.attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <span className="flex-1 text-sm font-medium text-gray-900">{file}</span>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Assignment Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{formatDate(selectedAssignment.dueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-medium">{selectedAssignment.maxPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                          {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submission Type:</span>
                        <span className="font-medium capitalize">{selectedAssignment.submissionType}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedAssignment.status === 'graded' && selectedAssignment.grade && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Grade Received</h4>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {selectedAssignment.grade}/{selectedAssignment.maxPoints}
                      </div>
                      {selectedAssignment.feedback && (
                        <div>
                          <p className="text-sm font-medium text-green-900 mb-1">Feedback:</p>
                          <p className="text-sm text-green-800">{selectedAssignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    {selectedAssignment.status === 'pending' && (
                      <button
                        onClick={() => setShowSubmissionModal(true)}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <Upload className="h-5 w-5" />
                        Submit Assignment
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedAssignment(null)}
                      className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Submit Assignment</h2>
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSubmissionText('');
                  setSubmissionFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{selectedAssignment.title}</h3>
                <p className="text-sm text-blue-800">Due: {formatDate(selectedAssignment.dueDate)}</p>
              </div>

              {(selectedAssignment.submissionType === 'text' || selectedAssignment.submissionType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Written Submission
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your written response here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {(selectedAssignment.submissionType === 'file' || selectedAssignment.submissionType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Upload
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                    >
                      Choose Files
                    </label>
                  </div>

                  {submissionFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                      <div className="space-y-2">
                        {submissionFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Before submitting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Review your work carefully</li>
                      <li>Ensure all required files are attached</li>
                      <li>Check that your submission meets all requirements</li>
                      <li>You can resubmit before the deadline if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSubmissionText('');
                  setSubmissionFiles([]);
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={!submissionText.trim() && submissionFiles.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};