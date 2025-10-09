import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Filter, Users, Clock, ThumbsUp, Reply, X, Send, Tag } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  author: string;
  course: string;
  lastReply: string;
  replies: number;
  likes: number;
  isResolved: boolean;
  tags: string[];
}

export const DiscussionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    course: '',
    tags: [] as string[]
  });
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: '1',
      title: 'Understanding Gradient Descent Algorithm',
      author: 'Alex Chen',
      course: 'Machine Learning Fundamentals',
      lastReply: '2 hours ago',
      replies: 12,
      likes: 8,
      isResolved: false,
      tags: ['machine-learning', 'algorithms', 'math']
    },
    {
      id: '2',
      title: 'Best Practices for Data Preprocessing',
      author: 'Sarah Kim',
      course: 'Data Science Fundamentals',
      lastReply: '5 hours ago',
      replies: 7,
      likes: 15,
      isResolved: true,
      tags: ['data-science', 'preprocessing', 'python']
    },
    {
      id: '3',
      title: 'Python Virtual Environments Setup Help',
      author: 'Mike Johnson',
      course: 'Advanced Python Programming',
      lastReply: '1 day ago',
      replies: 23,
      likes: 31,
      isResolved: true,
      tags: ['python', 'environment', 'setup']
    }
  ]);

  const courses = [
    'Machine Learning Fundamentals',
    'Data Science Fundamentals',
    'Advanced Python Programming',
    'Web Development Basics',
    'Database Design'
  ];

  const availableTags = ['machine-learning', 'python', 'data-science', 'algorithms', 'setup', 'web-dev', 'database'];

  const handleStartDiscussion = () => {
    setShowNewDiscussionModal(true);
  };

  const handleSubmitDiscussion = () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim() || !newDiscussion.course) {
      alert('Please fill in all required fields');
      return;
    }

    const discussion: Discussion = {
      id: Date.now().toString(),
      title: newDiscussion.title,
      author: 'You', // In real app, this would come from auth context
      course: newDiscussion.course,
      lastReply: 'Just now',
      replies: 0,
      likes: 0,
      isResolved: false,
      tags: newDiscussion.tags
    };

    setDiscussions([discussion, ...discussions]);
    setNewDiscussion({ title: '', content: '', course: '', tags: [] });
    setShowNewDiscussionModal(false);
  };

  const handleTagToggle = (tag: string) => {
    setNewDiscussion(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const tags = ['all', 'machine-learning', 'python', 'data-science', 'algorithms', 'setup'];

  const filteredDiscussions = discussions
    .filter(discussion =>
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.course.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(discussion => filterTag === 'all' || discussion.tags.includes(filterTag));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discussions</h1>
          <p className="text-gray-600">Engage with your peers and instructors</p>
        </div>
        <button
          onClick={handleStartDiscussion}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Start Discussion
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tags.map(tag => (
                <option key={tag} value={tag}>
                  {tag === 'all' ? 'All Topics' : tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <div
            key={discussion.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                    {discussion.title}
                  </h3>
                  {discussion.isResolved && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">in {discussion.course}</p>
                <div className="flex flex-wrap gap-2">
                  {discussion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>by {discussion.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{discussion.lastReply}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{discussion.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <Reply className="h-4 w-4" />
                  <span>{discussion.replies}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDiscussions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
          <p className="text-gray-600">Try adjusting your search or start a new discussion</p>
        </div>
      )}

      {/* New Discussion Modal */}
      {showNewDiscussionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Start New Discussion</h2>
              <button
                onClick={() => setShowNewDiscussionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discussion Title *
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What would you like to discuss?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={newDiscussion.course}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe your question or topic in detail..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${newDiscussion.tags.includes(tag)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                      <Tag className="h-3 w-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewDiscussionModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDiscussion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Start Discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
