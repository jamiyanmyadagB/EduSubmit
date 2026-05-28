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
  Calendar,
  AlertTriangle,
  Filter,
  Search,
  Trash2,
  Eye,
  X
} from 'lucide-react';

interface TeacherNotification {
  id: string;
  title: string;
  message: string;
  type: 'submission' | 'deadline' | 'ai_review' | 'exam_scheduled' | 'grade_published' | 'system';
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  relatedEntity?: {
    id: string;
    type: 'assignment' | 'submission' | 'exam';
    name: string;
  };
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<TeacherNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<TeacherNotification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch teacher notifications
    const fetchNotifications = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockNotifications: TeacherNotification[] = [
          {
            id: '1',
            title: 'New Student Submission',
            message: 'John Doe has submitted the Database Design Project assignment.',
            type: 'submission',
            timestamp: '2026-05-07T16:30:00',
            read: false,
            priority: 'medium',
            actionRequired: true,
            relatedEntity: {
              id: '1',
              type: 'assignment',
              name: 'Database Design Project'
            }
          },
          {
            id: '2',
            title: 'Late Submission Alert',
            message: 'Mike Johnson submitted Algorithm Analysis 1 hour after deadline.',
            type: 'submission',
            timestamp: '2026-05-11T01:15:00',
            read: false,
            priority: 'high',
            actionRequired: true,
            relatedEntity: {
              id: '2',
              type: 'assignment',
              name: 'Algorithm Analysis'
            }
          },
          {
            id: '3',
            title: 'AI Review Completed',
            message: 'AI analysis complete for Sarah Wilson\'s Web Development submission. High AI suspicion detected (68%).',
            type: 'ai_review',
            timestamp: '2026-05-07T14:45:00',
            read: false,
            priority: 'high',
            actionRequired: true,
            relatedEntity: {
              id: '3',
              type: 'submission',
              name: 'Web Development Assignment'
            }
          },
          {
            id: '4',
            title: 'Assignment Deadline Approaching',
            message: 'Algorithm Analysis assignment is due tomorrow. 7 students have not yet submitted.',
            type: 'deadline',
            timestamp: '2026-05-09T09:00:00',
            read: true,
            priority: 'medium',
            actionRequired: false,
            relatedEntity: {
              id: '2',
              type: 'assignment',
              name: 'Algorithm Analysis'
            }
          },
          {
            id: '5',
            title: 'Exam Scheduled',
            message: 'Database Systems Midterm has been scheduled for May 15, 2026 at 9:00 AM in Room 301.',
            type: 'exam_scheduled',
            timestamp: '2026-05-08T10:00:00',
            read: true,
            priority: 'medium',
            actionRequired: false,
            relatedEntity: {
              id: '1',
              type: 'exam',
              name: 'Database Systems Midterm'
            }
          },
          {
            id: '6',
            title: 'Grades Published',
            message: 'Grades for Web Development Assignment have been published. Average grade: 74.8%',
            type: 'grade_published',
            timestamp: '2026-05-06T16:00:00',
            read: true,
            priority: 'low',
            actionRequired: false,
            relatedEntity: {
              id: '3',
              type: 'assignment',
              name: 'Web Development Assignment'
            }
          },
          {
            id: '7',
            title: 'System Maintenance',
            message: 'The system will undergo maintenance on May 25, 2026 from 2:00 AM to 4:00 AM.',
            type: 'system',
            timestamp: '2026-05-05T10:00:00',
            read: false,
            priority: 'low',
            actionRequired: false
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
    // Filter notifications based on search and filters
    let filtered = notifications;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => 
        statusFilter === 'read' ? notification.read : !notification.read
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'submission': return <FileText className="w-4 h-4" />;
      case 'deadline': return <Clock className="w-4 h-4" />;
      case 'ai_review': return <AlertTriangle className="w-4 h-4" />;
      case 'exam_scheduled': return <Calendar className="w-4 h-4" />;
      case 'grade_published': return <CheckCircle className="w-4 h-4" />;
      case 'system': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-500 bg-red-50 text-red-700';
    if (priority === 'medium') return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    if (priority === 'low') return 'border-green-500 bg-green-50 text-green-700';
    return 'border-gray-500 bg-gray-50 text-gray-700';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'submission': return 'text-blue-600 bg-blue-50';
      case 'deadline': return 'text-orange-600 bg-orange-50';
      case 'ai_review': return 'text-purple-600 bg-purple-50';
      case 'exam_scheduled': return 'text-green-600 bg-green-50';
      case 'grade_published': return 'text-indigo-600 bg-indigo-50';
      case 'system': return 'text-gray-600 bg-gray-50';
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

  const handleViewDetails = (notification: TeacherNotification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  const handleActionClick = (notification: TeacherNotification) => {
    if (notification.relatedEntity) {
      switch (notification.relatedEntity.type) {
        case 'assignment':
          window.location.href = `/teacher/assignments`;
          break;
        case 'submission':
          window.location.href = `/teacher/submissions`;
          break;
        case 'exam':
          window.location.href = `/teacher/exam-timetable`;
          break;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with teaching activities</p>
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
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              <option value="submission">Submissions</option>
              <option value="deadline">Deadlines</option>
              <option value="ai_review">AI Reviews</option>
              <option value="exam_scheduled">Exams</option>
              <option value="grade_published">Grades</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
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
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Mark All as Read</span>
            </motion.button>
          )}
          
          {notifications.some(n => n.read) && (
            <motion.button
              onClick={handleClearAllRead}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Clear Read</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className={`
              ${!notification.read ? 'border-l-4 border-blue-500 bg-blue-50' : 'border-l-4 border-transparent'}
            `}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                        <span className="text-sm font-medium">{notification.type.toUpperCase()}</span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type, notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <motion.button
                        onClick={() => handleMarkAsRead(notification.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Mark as Read</span>
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={() => handleViewDetails(notification)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View Details</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleDeleteNotification(notification.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </motion.button>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <p className="text-gray-700">{notification.message}</p>
                </div>

                {/* Related Entity */}
                {notification.relatedEntity && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Related:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {notification.relatedEntity.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(notification.relatedEntity.type)}`}>
                        {notification.relatedEntity.type.toUpperCase()}
                      </span>
                    </div>
                    
                    {notification.actionRequired && (
                      <motion.button
                        onClick={() => handleActionClick(notification)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">Take Action</span>
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && !loading && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedNotification.timestamp).toLocaleString()}
                  </p>
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
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${getNotificationColor(selectedNotification.type, selectedNotification.priority)}`}>
                    {getNotificationIcon(selectedNotification.type)}
                    <span className="text-sm font-medium">{selectedNotification.type.toUpperCase()}</span>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNotificationColor(selectedNotification.type, selectedNotification.priority)}`}>
                    {selectedNotification.priority.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedNotification.title}</h3>
                  <p className="text-gray-700 mb-4">{selectedNotification.message}</p>
                </div>

                {selectedNotification.relatedEntity && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Related Entity</h4>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedNotification.relatedEntity.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(selectedNotification.relatedEntity.type)}`}>
                        {selectedNotification.relatedEntity.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">ID:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedNotification.relatedEntity.id}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                {!selectedNotification.read && (
                  <motion.button
                    onClick={() => handleMarkAsRead(selectedNotification.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Read</span>
                  </motion.button>
                )}
                
                {selectedNotification.actionRequired && selectedNotification.relatedEntity && (
                  <motion.button
                    onClick={() => handleActionClick(selectedNotification)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View Related</span>
                  </motion.button>
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
