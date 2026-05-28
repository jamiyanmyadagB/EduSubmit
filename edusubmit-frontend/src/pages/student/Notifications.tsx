import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Bell,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  X,
  Check,
  Trash2,
  Filter,
  Search
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'feedback' | 'grade' | 'announcement';
  timestamp: string;
  read: boolean;
  assignmentId?: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API call to fetch notifications
    const fetchNotifications = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Assignment Assigned',
            message: 'Database Design Project has been assigned. Due on May 15, 2026.',
            type: 'assignment',
            timestamp: '2026-05-07T10:30:00',
            read: false,
            assignmentId: '1',
            priority: 'high',
            actionRequired: true
          },
          {
            id: '2',
            title: 'Deadline Reminder',
            message: 'Algorithm Analysis assignment is due tomorrow. Make sure to submit on time.',
            type: 'deadline',
            timestamp: '2026-05-09T09:00:00',
            read: false,
            assignmentId: '2',
            priority: 'high',
            actionRequired: true
          },
          {
            id: '3',
            title: 'Feedback Added',
            message: 'Your submission for Web Development Assignment has been reviewed. Please check your feedback.',
            type: 'feedback',
            timestamp: '2026-05-06T14:30:00',
            read: false,
            assignmentId: '3',
            priority: 'medium',
            actionRequired: true
          },
          {
            id: '4',
            title: 'Grade Published',
            message: 'Your grade for Web Development Assignment is now available: 95%',
            type: 'grade',
            timestamp: '2026-05-06T16:00:00',
            read: false,
            assignmentId: '3',
            priority: 'medium',
            actionRequired: false
          },
          {
            id: '5',
            title: 'Assignment Deadline Extended',
            message: 'The deadline for Database Design Project has been extended to May 20, 2026.',
            type: 'announcement',
            timestamp: '2026-05-05T11:00:00',
            read: true,
            priority: 'medium',
            actionRequired: false
          },
          {
            id: '6',
            title: 'System Maintenance',
            message: 'The system will be under maintenance on May 25, 2026 from 2:00 AM to 4:00 AM.',
            type: 'announcement',
            timestamp: '2026-05-04T10:00:00',
            read: true,
            priority: 'low',
            actionRequired: false
          },
          {
            id: '7',
            title: 'Late Submission Warning',
            message: 'Your Algorithm Analysis submission was submitted 2 hours after the deadline. Late submission approval is pending.',
            type: 'deadline',
            timestamp: '2026-05-11T01:15:00',
            read: false,
            assignmentId: '2',
            priority: 'high',
            actionRequired: true
          }
        ];

        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
        setLoading(false);
      }, 1000);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    // Filter notifications based on search and type
    let filtered = notifications;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="w-5 h-5" />;
      case 'deadline': return <Clock className="w-5 h-5" />;
      case 'feedback': return <FileText className="w-5 h-5" />;
      case 'grade': return <CheckCircle className="w-5 h-5" />;
      case 'announcement': return <Bell className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-500 bg-red-50';
    if (priority === 'medium') return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-500 bg-gray-50';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'text-blue-600 bg-blue-50';
      case 'deadline': return 'text-orange-600 bg-orange-50';
      case 'feedback': return 'text-purple-600 bg-purple-50';
      case 'grade': return 'text-green-600 bg-green-50';
      case 'announcement': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    // In real app, this would call API to mark as read
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    // In real app, this would call API to mark all as read
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    // In real app, this would call API to delete notification
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const handleClearAllRead = () => {
    // In real app, this would call API to clear all read notifications
    setNotifications(prev => prev.filter(notification => !notification.read));
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  const handleActionClick = (notification: Notification) => {
    // Handle different actions based on notification type
    if (notification.assignmentId) {
      // Navigate to assignment page
      window.location.href = `/student/assignments`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your academic activities</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            >
              <option value="all">All Types</option>
              <option value="assignment">Assignments</option>
              <option value="deadline">Deadlines</option>
              <option value="feedback">Feedback</option>
              <option value="grade">Grades</option>
              <option value="announcement">Announcements</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
          
          {unreadCount > 0 && (
            <motion.button
              onClick={handleMarkAllAsRead}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Mark All as Read</span>
            </motion.button>
          )}
        </div>
        
        {notifications.some(n => n.read) && (
          <motion.button
            onClick={handleClearAllRead}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Clear Read</span>
          </motion.button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification, index) => {
          const Icon = getNotificationIcon(notification.type);
          const isUnread = !notification.read;
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className={`
                ${isUnread ? 'border-l-4 border-blue-500 bg-blue-50' : 'border-l-4 border-transparent'}
              `}>
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isUnread ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {Icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{notification.message}</p>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {notification.actionRequired && (
                            <motion.button
                              onClick={() => handleActionClick(notification)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>View Assignment</span>
                            </motion.button>
                          )}
                          
                          <motion.button
                            onClick={() => handleViewDetails(notification)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-1 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Details</span>
                          </motion.button>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isUnread && (
                            <motion.button
                              onClick={() => handleMarkAsRead(notification.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Check className="w-3 h-3" />
                              <span>Mark as Read</span>
                            </motion.button>
                          )}
                          
                          <motion.button
                            onClick={() => handleDeleteNotification(notification.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && !loading && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'No notifications at the moment'}
          </p>
        </div>
      )}

      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${!selectedNotification.read ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedNotification.title}</h2>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedNotification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedNotification.type)}`}>
                    {selectedNotification.type}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getNotificationColor(selectedNotification.type, selectedNotification.priority)}`}>
                    {selectedNotification.priority.toUpperCase()}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>

                {selectedNotification.actionRequired && (
                  <div className="flex items-center justify-center">
                    <motion.button
                      onClick={() => {
                        handleActionClick(selectedNotification);
                        handleCloseModal();
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>Take Action</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
