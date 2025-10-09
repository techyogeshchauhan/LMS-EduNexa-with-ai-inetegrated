import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  Calendar,
  Play,
  Eye
} from 'lucide-react';

export const QuizDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [quizStarted, setQuizStarted] = useState(false);

  const quiz = {
    id: '1',
    title: 'Machine Learning Fundamentals Quiz',
    description: 'Test your understanding of basic machine learning concepts.',
    courseName: 'Introduction to Machine Learning',
    timeLimit: 30,
    totalQuestions: 10,
    totalPoints: 100,
    passingScore: 70,
    maxAttempts: 2,
    attempts: 1,
    bestScore: 85,
    status: 'available',
    dueDate: '2024-02-20T23:59:00Z'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.courseName}</p>
          </div>
          
          <div className="px-4 py-2 rounded-lg font-medium bg-green-100 text-green-800">
            Available
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h2>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{quiz.timeLimit} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-400" />
                <span>{quiz.totalPoints} points</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span>{quiz.totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Due: {formatDate(quiz.dueDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {quiz.bestScore && (
              <div className="mb-2">
                <div className="text-2xl font-bold text-green-600">{quiz.bestScore}%</div>
                <div className="text-sm text-gray-500">Best Score</div>
              </div>
            )}
            <div className="text-sm text-gray-500">
              Attempts: {quiz.attempts}/{quiz.maxAttempts}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Quiz Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You have {quiz.timeLimit} minutes to complete this quiz</li>
            <li>• You can attempt this quiz up to {quiz.maxAttempts} times</li>
            <li>• You need {quiz.passingScore}% to pass</li>
            <li>• Results will be shown immediately after submission</li>
          </ul>
        </div>

        {!quizStarted && quiz.attempts < quiz.maxAttempts && (
          <div className="text-center">
            <button
              onClick={() => setQuizStarted(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Play className="h-5 w-5" />
              Start Quiz
            </button>
          </div>
        )}

        {quiz.attempts > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Attempts</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Attempt 1</div>
                <div className="text-sm text-gray-500">Completed on {formatDate('2024-02-10T14:30:00Z')}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">{quiz.bestScore}%</div>
                <div className="text-sm text-gray-500">8/10 correct</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};