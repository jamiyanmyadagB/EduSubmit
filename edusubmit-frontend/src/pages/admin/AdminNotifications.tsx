import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Filter,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  Shield,
  Database,
  Calendar,
  MoreVertical,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  Archive
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

interface AdminNotification {
  id: string;
  type: 'user_created' | 'user_disabled' | 'role_changed' | 'section_created' | 'section_archived' | 'system_alert' | 'security_alert' | 'maintenance';
  title: string;
  message: string;
  details?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'read' | 'unread';
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    userId?: string;
    userName?: string;
    sectionId?: string;
    sectionName?: string;
    oldRole?: string;
    newRole?: string;
    [key: string]: any;
  };
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch admin notifications
    const fetchNotifications = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockNotifications: AdminNotification[] = [
          {
            id: '1',
            type: 'user_created',
            title: 'New User Account Created',
            message: 'A new student account has been created and is pending verification.',
            details: 'Student ID: LPU2026001, Section: CSE-A, Email: john.doe@lpu.in',
            priority: 'medium',
            status: 'unread',
            timestamp: '2026-05-08T10:30:00',
            actionUrl: '/admin/users',
            actionLabel: 'View User',
            metadata: {
              userId: '123',
              userName: 'John Doe',
              sectionName: 'CSE-A'
            }
          },
          {
            id: '2',
            type: 'role_changed',
            title: 'User Role Updated',
            message: 'User role has been changed from Student to Teacher.',
            details: 'User: Jane Smith, Previous Role: Student, New Role: Teacher, Sections: CSE-B, CSE-C',
            priority: 'high',
            status: 'unread',
            timestamp: '2026-05-08T09:15:00',
            actionUrl: '/admin/users',
            actionLabel: 'View User',
            metadata: {
              userId: '456',
              userName: 'Jane Smith',
              oldRole: 'STUDENT',
              newRole: 'TEACHER'
            }
          },
          {
            id: '3',
            type: 'section_created',
            title: 'New Section Created',
            message: 'A new section has been created in the system.',
            details: 'Section: AIML-1, Assigned Teacher: Dr. Smith, Student Capacity: 80',
            priority: 'medium',
            status: 'read',
            timestamp: '2026-05-08T08:45:00',
            actionUrl: '/admin/sections',
            actionLabel: 'View Section',
            metadata: {
              sectionId: '789',
              sectionName: 'AIML-1'
            }
          },
          {
            id: '4',
            type: 'system_alert',
            title: 'High API Response Time',
            message: 'API response time has exceeded the threshold.',
            details: 'Average response time: 2.3s, Threshold: 1.0s, Duration: 15 minutes',
            priority: 'high',
            status: 'unread',
            timestamp: '2026-05-08T07:30:00',
            actionUrl: '/admin/monitoring',
            actionLabel: 'View Monitoring'
          },
          {
            id: '5',
            type: 'security_alert',
            title: 'Multiple Failed Login Attempts',
            message: 'Multiple failed login attempts detected from same IP.',
            details: 'IP: 192.168.1.100, Attempts: 5, User: admin@lpu.in',
            priority: 'high',
            status: 'unread',
            timestamp: '2026-05-08T06:45:00',
            actionUrl: '/admin/monitoring',
            actionLabel: 'View Security Logs'
          },
          {
            id: '6',
            type: 'maintenance',
            title: 'Scheduled Maintenance',
            message: 'System maintenance scheduled for tomorrow.',
            details: 'Date: 2026-05-09, Time: 02:00 AM - 04:00 AM, Duration: 2 hours',
            priority: 'medium',
            status: 'read',
            timestamp: '2026-05-07T16:20:00'
          },
          {
            id: '7',
            type: 'section_archived',
            title: 'Section Archived',
            message: 'Section has been archived successfully.',
            details: 'Section: CSE-2020, Students: 0, Reason: Batch completed',
            priority: 'low',
            status: 'read',
            timestamp: '2026-05-07T14:30:00',
            metadata: {
              sectionId: '101',
              sectionName: 'CSE-2020'
            }
          },
          {
            id: '8',
            type: 'user_disabled',
            title: 'User Account Disabled',
            message: 'User account has been disabled due to policy violation.',
            details: 'User: Mike Johnson, Reason: Multiple academic misconduct reports',
            priority: 'high',
            status: 'read',
            timestamp: '2026-05-07T12:15:00',
            actionUrl: '/admin/users',
            actionLabel: 'View User',
            metadata: {
              userId: '789',
              userName: 'Mike Johnson'
            }
          }
        ];

        setNotifications(mockNotifications);
        setLoading(false);
      }, 1000);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.details && notification.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(notification => notification.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, priorityFilter, statusFilter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_created': return Users;
      case 'user_disabled': return Users;
      case 'role_changed': return Shield;
      case 'section_created': return Database;
      case 'section_archived': return Archive;
      case 'system_alert': return AlertTriangle;
      case 'security_alert': return AlertTriangle;
      case 'maintenance': return Calendar;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user_created': return 'text-blue-600 bg-blue-100';
      case 'user_disabled': return 'text-red-600 bg-red-100';
      case 'role_changed': return 'text-purple-600 bg-purple-100';
      case 'section_created': return 'text-green-600 bg-green-100';
      case 'section_archived': return 'text-gray-600 bg-gray-100';
      case 'system_alert': return 'text-orange-600 bg-orange-100';
      case 'security_alert': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, status: 'read' }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      status: 'read'
    })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
    setDropdownOpen(null);
  };

  const clearReadNotifications = () => {
    setNotifications(notifications.filter(notification => notification.status === 'unread'));
  };

  const openDetailsModal = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Notifications</h1>
          <p className="text-gray-600 mt-2">System alerts and administrative updates</p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckSquare className="w-5 h-5" />
              <span>Mark All Read</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearReadNotifications}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Archive className="w-5 h-5" />
            <span>Clear Read</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <Bell className="w-8 h-8 text-purple-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Alerts</p>
              <p className="text-2xl font-bold text-orange-600">
                {notifications.filter(n => n.type === 'system_alert' || n.type === 'security_alert').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'type' ? null : 'type')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Type: {typeFilter === 'all' ? 'All' : typeFilter.replace('_', ' ')}</span>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'type' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setDropdownOpen(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  All Types
                </button>
                {['user_created', 'user_disabled', 'role_changed', 'section_created', 'section_archived', 'system_alert', 'security_alert', 'maintenance'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setTypeFilter(type);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 capitalize"
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'priority' ? null : 'priority')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Priority: {priorityFilter === 'all' ? 'All' : priorityFilter}</span>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'priority' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                {['all', 'high', 'medium', 'low'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => {
                      setPriorityFilter(priority);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    {priority === 'all' ? 'All Priorities' : priority}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'status' ? null : 'status')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'status' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                {['all', 'read', 'unread'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    {status === 'all' ? 'All Status' : status}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notifications List */}
      <GlassCard>
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                    notification.status === 'unread' ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => openDetailsModal(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {notification.actionLabel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to action URL
                                console.log('Navigate to:', notification.actionUrl);
                              }}
                              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                            >
                              {notification.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.status === 'unread' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as read"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(dropdownOpen === notification.id ? null : notification.id);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        <AnimatePresence>
                          {dropdownOpen === notification.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetailsModal(notification);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Notification Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-start space-x-3">
                  <div className={`p-3 rounded-full ${getTypeColor(selectedNotification.type)}`}>
                    {(() => {
                      const Icon = getTypeIcon(selectedNotification.type);
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedNotification.title}</h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                        {selectedNotification.priority} priority
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedNotification.type)}`}>
                        {selectedNotification.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(selectedNotification.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{selectedNotification.message}</p>
                    {selectedNotification.details && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedNotification.details}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNotification.actionLabel && (
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // Navigate to action URL
                        console.log('Navigate to:', selectedNotification.actionUrl);
                        setShowDetailsModal(false);
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {selectedNotification.actionLabel}
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNotifications;
