import React, { useState } from 'react';
import {
  Bell,
  Check,
  X,
  Filter,
  Search,
  BookOpen,
  FileText,
  MessageSquare,
  Award,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  Mail
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'course' | 'assignment' | 'message' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'assignment',
      title: 'Assignment Due Soon',
      message: 'Your Machine Learning assignment is due in 2 hours',
      timestamp: '2024-02-10T14:30:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/assignments/1'
    },
    {
      id: '2',
      type: 'course',
      title: 'New Course Material',
      message: 'New lecture notes have been added to Python Programming',
      timestamp: '2024-02-10T12:15:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/courses/2'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Quiz Master" badge for scoring 100% on 5 quizzes',
      timestamp: '2024-02-10T10:45:00Z',
      read: true,
      priority: 'low',
      actionUrl: '/profile'
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message',
      message: 'Dr. Smith replied to your question about linear regression',
      timestamp: '2024-02-10T09:20:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/messages/4'
    },
    {
      id: '5',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM EST',
      timestamp: '2024-02-09T16:00:00Z',
      read: true,
      priority: 'low'
    },
    {
      id: '6',
      type: 'course',
      title: 'Course Completed',
      message: 'Congratulations! You have completed Data Science Fundamentals',
      timestamp: '2024-02-09T14:30:00Z',
      read: true,
      priority: 'high',
      actionUrl: '/courses/3'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'assignment': return FileText;
      case 'message': return MessageSquare;
      case 'achievement': return Award;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    if (priority === 'medium') return 'text-yellow-600 bg-yellow-100';

    switch (type) {
      case 'course': return 'text-blue-600 bg-blue-100';
      case 'assignment': return 'text-purple-600 bg-purple-100';
      case 'message': return 'text-green-600 bg-green-100';
      case 'achievement': return 'text-orange-600 bg-orange-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      if (filter !== 'all') return notification.type === filter;
      return true;
    })
    .filter(notification =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteSelected = () => {
    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(visibleIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle different notification types
    if (notification.actionUrl) {
      // Simulate navigation - in a real app, you'd use React Router
      if (notification.actionUrl.includes('/assignments')) {
        // Navigate to assignments page
        window.location.hash = '#/assignments';
        alert(`Navigating to assignment: ${notification.title}`);
      } else if (notification.actionUrl.includes('/courses')) {
        // Navigate to courses page
        window.location.hash = '#/courses';
        alert(`Navigating to course: ${notification.title}`);
      } else if (notification.actionUrl.includes('/messages')) {
        // Navigate to messages page
        window.location.hash = '#/messages';
        alert(`Opening message: ${notification.title}`);
      } else if (notification.actionUrl.includes('/profile')) {
        // Navigate to profile page
        window.location.hash = '#/profile';
        alert(`Opening profile: ${notification.title}`);
      } else {
        // Show notification details
        setSelectedNotification(notification);
        setShowDetailModal(true);
      }
    } else {
      // Show notification details for notifications without action URLs
      setSelectedNotification(notification);
      setShowDetailModal(true);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedNotifications.length > 0 && (
              <button
                onClick={deleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
            )}
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="course">Courses</option>
              <option value="assignment">Assignments</option>
              <option value="message">Messages</option>
              <option value="achievement">Achievements</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {filteredNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedNotifications.length === 0 ? (
                <button
                  onClick={selectAllVisible}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Select All
                </button>
              ) : (
                <button
                  onClick={clearSelection}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                >
                  Clear Selection ({selectedNotifications.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const colorClasses = getNotificationColor(notification.type, notification.priority);

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
                  } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectNotification(notification.id);
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.priority === 'high' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                High Priority
                              </span>
                            )}
                            {!notification.read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {notification.actionUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Open
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.read ? markAsUnread(notification.id) : markAsRead(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title={notification.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {notification.read ? <Mail className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'You\'re all caught up! New notifications will appear here.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      )}

      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getNotificationColor(selectedNotification.type, selectedNotification.priority)}`}>
                  {React.createElement(getNotificationIcon(selectedNotification.type), { className: "h-5 w-5" })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedNotification.title}</h2>
                  <p className="text-sm text-gray-500 capitalize">{selectedNotification.type} notification</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedNotification(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                <p className="text-gray-700 leading-relaxed">{selectedNotification.message}</p>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Received:</span> {formatTimestamp(selectedNotification.timestamp)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Priority:</span> 
                    <span className={`ml-1 capitalize ${
                      selectedNotification.priority === 'high' ? 'text-red-600 font-medium' :
                      selectedNotification.priority === 'medium' ? 'text-yellow-600 font-medium' :
                      'text-gray-600'
                    }`}>
                      {selectedNotification.priority}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedNotification.read ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Unread
                    </span>
                  )}
                </div>
              </div>

              {selectedNotification.actionUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">This notification has an associated action:</p>
                  <button
                    onClick={() => {
                      handleNotificationClick(selectedNotification);
                      setShowDetailModal(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    Take Action
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    selectedNotification.read ? markAsUnread(selectedNotification.id) : markAsRead(selectedNotification.id);
                    setSelectedNotification(prev => prev ? { ...prev, read: !prev.read } : null);
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                >
                  {selectedNotification.read ? <Mail className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  Mark as {selectedNotification.read ? 'Unread' : 'Read'}
                </button>
                <button
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    setShowDetailModal(false);
                    setSelectedNotification(null);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedNotification(null);
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};