import React, { useState, useEffect } from 'react';
import { X, Award, AlertCircle, FileText, Download, Calendar, User } from 'lucide-react';
import { AssignmentAPI } from '../../services/assignmentAPI';
import { Toast } from '../common/Toast';
import { validateForm, gradingValidationRules } from '../../utils/validation';

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

interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  maxPoints: number;
  onGradeSubmitted: () => void;
}

export const GradingModal: React.FC<GradingModalProps> = ({
  isOpen,
  onClose,
  submission,
  maxPoints,
  onGradeSubmitted
}) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade?.toString() || '');
      setFeedback(submission.feedback || '');
      setErrors({});
    }
  }, [submission]);

  const validateFormData = (): boolean => {
    const validation = validateForm(
      { grade, feedback },
      gradingValidationRules(maxPoints)
    );
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submission || !validateFormData()) {
      return;
    }

    setSubmitting(true);
    try {
      await AssignmentAPI.gradeSubmission(submission._id, {
        grade: parseFloat(grade),
        feedback: feedback.trim()
      });

      setToast({ type: 'success', message: 'Grade submitted successfully!' });
      
      setTimeout(() => {
        onGradeSubmitted();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error grading submission:', error);
      setToast({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to submit grade' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setGrade('');
    setFeedback('');
    setErrors({});
    onClose();
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

  const getGradePercentage = (): number => {
    const gradeValue = parseFloat(grade);
    if (isNaN(gradeValue) || maxPoints === 0) return 0;
    return (gradeValue / maxPoints) * 100;
  };

  const getGradeColor = (): string => {
    const percentage = getGradePercentage();
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isOpen || !submission) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Grade Submission</h2>
              <p className="text-gray-600 mt-1">{submission.student_name}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Submission Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{submission.student_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Roll No:</span>
                      <span className="font-medium text-gray-900">{submission.roll_no}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium text-gray-900">{formatDate(submission.submitted_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Submission Content */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Submission Content</h3>
                  
                  {submission.text_content && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Text Response:</p>
                      <div className="text-gray-900 whitespace-pre-wrap">
                        {submission.text_content}
                      </div>
                    </div>
                  )}

                  {submission.file_name && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">{submission.file_name}</p>
                            <p className="text-xs text-blue-700">Attached file</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {!submission.text_content && !submission.file_name && (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No submission content available</p>
                    </div>
                  )}
                </div>

                {/* Previous Grade/Feedback */}
                {submission.status === 'graded' && submission.grade !== undefined && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Current Grade</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {submission.grade}/{maxPoints}
                      </span>
                      <span className="text-sm text-green-700">
                        ({((submission.grade / maxPoints) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {submission.feedback && (
                      <div>
                        <p className="text-sm font-medium text-green-900 mb-1">Previous Feedback:</p>
                        <p className="text-sm text-green-800">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grading Form */}
              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Grade Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade (out of {maxPoints}) *
                    </label>
                    <input
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max={maxPoints}
                      step="0.5"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold ${
                        errors.grade ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={`0-${maxPoints}`}
                      disabled={submitting}
                    />
                    {errors.grade && (
                      <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
                    )}
                    
                    {grade && !errors.grade && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Percentage</span>
                          <span className={`font-semibold ${getGradeColor()}`}>
                            {getGradePercentage().toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              getGradePercentage() >= 70 ? 'bg-green-500' :
                              getGradePercentage() >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(getGradePercentage(), 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Provide constructive feedback to help the student improve..."
                      disabled={submitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {feedback.length} characters
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Note</p>
                        <p>
                          The student will receive a notification about their grade and feedback. 
                          Make sure your feedback is constructive and helpful.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting || !grade}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4" />
                          {submission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};
