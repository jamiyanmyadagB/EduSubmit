import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Bell,
  Users,
  BookOpen,
  Calendar,
  Settings,
  Shield,
  LogOut,
  Filter,
  Search,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  MoreVertical,
  Mail,
  UserPlus
} from 'lucide-react';

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'user_created' | 'user_disabled' | 'section_created' | 'assignment_created' | 'submission_reviewed' | 'system_alert' | 'role_changed' | 'security_alert';
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  relatedEntity?: {
    id: string;
    type: 'user' | 'section' | 'assignment' | 'system';
    name: string;
  };
  details?: any;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AdminNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch admin notifications
    const fetchNotifications = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockNotifications: AdminNotification[] = [
          {
            id: '1',
            title: 'New User Created',
            message: 'Student John Doe has been created and assigned to CS-A section',
            type: 'user_created',
            timestamp: '2026-05-07T10:30:00',
            read: false,
            priority: 'medium',
            actionRequired: true,
            relatedEntity: {
              id: 'user123',
              type: 'user',
              name: 'John Doe'
            },
            details: {
              email: 'john.doe@lpu.in',
              role: 'STUDENT',
              section: 'CS-A'
            }
          },
          {
            id: '2',
            title: 'User Account Disabled',
            message: 'Student Mike Johnson account has been disabled due to inactivity',
            type: 'user_disabled',
            timestamp: '2026-05-06T11:30:00',
            read: false,
            priority: 'high',
            actionRequired: true,
            relatedEntity: {
              id: 'user456',
              type: 'user',
              name: 'Mike Johnson'
            },
            details: {
              reason: 'inactivity',
              lastLogin: '2026-04-08T08:30:00',
              section: 'CS-B'
            }
          },
          {
            id: '3',
            title: 'Section Created',
            message: 'New section CS-D has been created with 18 students',
            type: 'section_created',
            timestamp: '2026-05-05T14:20:00',
            read: false,
            priority: 'medium',
            actionRequired: true,
            relatedEntity: {
              id: 'section4',
              type: 'section',
              name: 'CS-D'
            },
            details: {
              studentCount: 18,
              teacher: 'Alice Davis',
              description: 'Computer Science Section D - Focus on artificial intelligence and machine learning'
            }
          },
          {
            id: '4',
            title: 'Assignment Created',
            message: 'Teacher Sarah Johnson created "Database Design Project" assignment for CS-A section',
            type: 'assignment_created',
            timestamp: '2026-05-05T16:45:00',
            read: false,
            priority: 'medium',
            actionRequired: true,
            relatedEntity: {
              id: 'assignment789',
              type: 'assignment',
              name: 'Database Design Project'
            },
            details: {
              teacher: 'Sarah Johnson',
              section: 'CS-A',
              deadline: '2026-05-15T23:59:59',
              totalStudents: 20
            }
          },
          {
            id: '5',
            title: 'Submission Reviewed',
            message: 'Admin reviewed 5 submissions from Algorithm Analysis assignment',
            type: 'submission_reviewed',
            timestamp: '2026-05-07T14:15:00',
            read: false,
            priority: 'medium',
            actionRequired: true,
            relatedEntity: {
              id: 'assignment456',
              type: 'assignment',
              name: 'Algorithm Analysis'
            },
            details: {
              reviewedBy: 'admin',
              submissionsReviewed: 5,
              averageGrade: 78.5,
              issuesFound: 2
            }
          },
          {
            id: '6',
            title: 'System Alert',
            message: 'Database backup completed successfully. All services are operating normally.',
            type: 'system_alert',
            timestamp: '2026-05-07T09:00:00',
            read: false,
            priority: 'low',
            actionRequired: false,
            details: {
              backupSize: '2.3GB',
              duration: '45 minutes',
              status: 'completed'
            }
          },
          {
            id: '7',
            title: 'Role Change',
            message: 'User Alice Davis role has been changed from TEACHER to ADMIN',
            type: 'role_changed',
            timestamp: '2026-05-06T15:30:00',
            read: false,
            priority: 'high',
            actionRequired: true,
            relatedEntity: {
              id: 'user789',
              type: 'user',
              name: 'Alice Davis'
            },
            details: {
              previousRole: 'TEACHER',
              newRole: 'ADMIN',
              changedBy: 'superadmin',
              reason: 'Promotion to administrative role'
            }
          },
          {
            id: '8',
            title: 'Security Alert',
            message: 'Multiple failed login attempts detected from IP address 192.168.1.100',
            type: 'security_alert',
            timestamp: '2026-05-07T08:45:00',
            read: false,
            priority: 'high',
            actionRequired: true,
            relatedEntity: {
              id: 'security123',
              type: 'system',
              name: 'Security System'
            },
            details: {
              ip: '192.168.1.100',
              attempts: 5,
              timeframe: '5 minutes',
              action: 'IP blocked'
            }
          }
        ];

        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
        setLoading(false);
      }, 1500);
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

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(notification => notification.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, statusFilter, priorityFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_created': return <UserPlus className="w-4 h-4" />;
      case 'user_disabled': return <AlertTriangle className="w-4 h-4" />;
      case 'section_created': return <BookOpen className="w-4 h-4" />;
      case 'assignment_created': return <BookOpen className="w-4 h-4" />;
      case 'submission_reviewed': return <CheckCircle className="w-4 h-4" />;
      case 'system_alert': return <Bell className="w-4 h-4" />;
      case 'role_changed': return <Shield className="w-4 h-4" />;
      case 'security_alert': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-500 bg-red-50 text-red-700';
    if (priority === 'medium') return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    if (priority === 'low') return 'border-green-500 bg-green-50 text-green-700';
    
    switch (type) {
      case 'user_created': return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'user_disabled': return 'border-red-500 bg-red-50 text-red-700';
      case 'section_created': return 'border-purple-500 bg-purple-50 text-purple-700';
      case 'assignment_created': return 'border-indigo-500 bg-indigo-50 text-indigo-700';
      case 'submission_reviewed': return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'system_alert': return 'border-gray-500 bg-gray-50 text-gray-700';
      case 'role_changed': return 'border-purple-500 bg-purple-50 text-purple-700';
      case 'security_alert': return 'border-red-500 bg-red-50 text-red-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user_created': return 'text-blue-600 bg-blue-50';
      case 'user_disabled': return 'text-red-600 bg-red-50';
      case 'section_created': return 'text-purple-600 bg-purple-50';
      case 'assignment_created': return 'text-indigo-600 bg-indigo-50';
      case 'submission_reviewed': return 'text-orange-600 bg-orange-50';
      case 'system_alert': return 'text-gray-600 bg-gray-50';
      case 'role_changed': return 'text-purple-600 bg-purple-50';
      case 'security_alert': return 'text-red-600 bg-red-50';
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

  const handleViewDetails = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
          <p className="text-gray-600">Monitor system events and administrative actions</p>
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
              <option value="user_created">User Created</option>
              <option value="user_disabled">User Disabled</option>
              <option value="section_created">Section Created</option>
              <option value="assignment_created">Assignment Created</option>
              <option value="submission_reviewed">Submission Reviewed</option>
              <option value="system_alert">System Alert</option>
              <option value="role_changed">Role Changed</option>
              <option value="security_alert">Security Alert</option>
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

          {/* Priority Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Bell className="w-4 h-4" />
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
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(selectedNotification.type, selectedNotification.priority)}`}>
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
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedNotification.relatedEntity.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(selectedNotification.relatedEntity.type)}`}>
                          {selectedNotification.relatedEntity.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedNotification.relatedEntity.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">ID:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedNotification.relatedEntity.id}
                        </span>
                      </div>
                    </div>

                    {selectedNotification.details && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-2">Additional Details</h5>
                        <div className="space-y-2">
                          {Object.entries(selectedNotification.details).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    <span>View Related Entity</span>
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
