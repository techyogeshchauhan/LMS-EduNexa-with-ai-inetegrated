import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/tokenHelper';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  Eye,
  Edit,
  Calendar,
  AlertCircle,
  Download
} from 'lucide-react';
import { Toast } from '../common/Toast';

interface Submission {
  _id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no: string;
  text_content: string;
  file_name: string;
  file_path: string;
  submitted_at: string;
  status: string;
  grade?: number;
  feedback?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course_id: string;
  course_title: string;
  due_date: string;
  max_points: number;
  submission_count: number;
  submissions?: Submission[];
}

export const TeacherAssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradingModal, setGradingModal] = useState<{ show: boolean, submission: Submission | null }>({ 
    show: false, 
    submission: null 
  });
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/assignments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setToast({ type: 'error', message: 'Failed to load assignments' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDetails = async (assignmentId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAssignment(data.assignment);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      setToast({ type: 'error', message: 'Failed to load assignment details' });
    }
  };

  const handleGradeSubmission = async () => {
    if (!gradingModal.submission) return;

    const gradeValue = parseFloat(grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > (selectedAssignment?.max_points || 100)) {
      setToast({ 
        type: 'error', 
        message: `Grade must be between 0 and ${selectedAssignment?.max_points || 100}` 
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `http://localhost:5000/api/assignments/submissions/${gradingModal.submission._id}/grade`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grade: gradeValue,
            feedback: feedback.trim()
          })
        }
      );

      if (response.ok) {
        setToast({ type: 'success', message: 'Grade submitted successfully!' });
        setGradingModal({ show: false, submission: null });
        setGrade('');
        setFeedback('');
        
        // Refresh assignment details
        if (selectedAssignment) {
          fetchAssignmentDetails(selectedAssignment._id);
        }
      } else {
        const data = await response.json();
        setToast({ type: 'error', message: data.error || 'Failed to submit grade' });
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      setToast({ type: 'error', message: 'Failed to submit grade' });
    } finally {
      setSubmitting(false);
    }
  };

  const openGradingModal = (submission: Submission) => {
    setGradingModal({ show: true, submission });
    setGrade(submission.grade?.toString() || '');
    setFeedback(submission.feedback || '');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionStats = (assignment: Assignment) => {
    if (!assignment.submissions) return { total: 0, graded: 0, pending: 0 };
    
    const total = assignment.submissions.length;
    const graded = assignment.submissions.filter(s => s.status === 'graded').length;
    const pending = total - graded;
    
    return { total, graded, pending };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (selectedAssignment) {
    const stats = getSubmissionStats(selectedAssignment);
    
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedAssignment(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to Assignments
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAssignment.title}</h2>
          <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Total Submissions</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Graded</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.graded}</p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Max Points</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{selectedAssignment.max_points}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Submissions</h3>
          
          {!selectedAssignment.submissions || selectedAssignment.submissions.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions yet</p>
            </div>
          ) : (
            selectedAssignment.submissions.map((submission) => (
              <div key={submission._id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{submission.student_name}</h4>
                      <span className="text-sm text-gray-500">{submission.roll_no}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'graded' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{submission.student_email}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Submission:</p>
                      <p className="text-gray-600">{submission.text_content}</p>
                      
                      {submission.file_name && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                          <FileText className="h-4 w-4" />
                          <span>{submission.file_name}</span>
                          <button className="hover:underline flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {formatDate(submission.submitted_at)}</span>
                      </div>
                      
                      {submission.grade !== undefined && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <Award className="h-4 w-4" />
                          <span>Grade: {submission.grade}/{selectedAssignment.max_points}</span>
                        </div>
                      )}
                    </div>
                    
                    {submission.feedback && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                        <p className="text-sm text-blue-800">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openGradingModal(submission)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {submission.status === 'graded' ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit Grade
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        Grade
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Grading Modal */}
        {gradingModal.show && gradingModal.submission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Grade Submission</h2>
                <p className="text-gray-600 mt-1">{gradingModal.submission.student_name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade (out of {selectedAssignment.max_points})
                  </label>
                  <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    min="0"
                    max={selectedAssignment.max_points}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter grade (0-${selectedAssignment.max_points})`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Note</p>
                    <p className="text-sm text-yellow-700">
                      Student will receive a notification about their grade and feedback.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setGradingModal({ show: false, submission: null });
                    setGrade('');
                    setFeedback('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmission}
                  disabled={submitting || !grade}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4" />
                      Submit Grade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assignment Management</h1>
        <p className="text-gray-600">Review and grade student submissions</p>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assignments found</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <p className="text-sm text-blue-600 mb-3">Course: {assignment.course_title}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{assignment.max_points} points</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{assignment.submission_count} submissions</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => fetchAssignmentDetails(assignment._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Submissions
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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