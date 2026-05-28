import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { AnimatedCard, StaggerContainer } from '../../components/ui/AnimatedComponents';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Bell,
  Brain
} from 'lucide-react';

interface DashboardStats {
  totalAssignments: number;
  pendingAssignments: number;
  inProgressAssignments: number;
  completedAssignments: number;
  upcomingExams: number;
  lateSubmissions: number;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed' | 'late';
  grade?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'feedback' | 'grade';
  timestamp: string;
  read: boolean;
}

interface AIReminder {
  id: string;
  message: string;
  type: 'deadline' | 'assignment' | 'study';
  priority: 'high' | 'medium' | 'low';
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssignments: 0,
    pendingAssignments: 0,
    inProgressAssignments: 0,
    completedAssignments: 0,
    upcomingExams: 0,
    lateSubmissions: 0,
  });

  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiReminders, setAiReminders] = useState<AIReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls for dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      setTimeout(() => {
        const mockStats: DashboardStats = {
          totalAssignments: 12,
          pendingAssignments: 3,
          inProgressAssignments: 2,
          completedAssignments: 7,
          upcomingExams: 2,
          lateSubmissions: 1,
        };

        const mockAssignments: Assignment[] = [
          {
            id: '1',
            title: 'Database Design Project',
            subject: 'Computer Science',
            deadline: '2026-05-10T23:59:59',
            status: 'pending',
          },
          {
            id: '2',
            title: 'Algorithm Analysis',
            subject: 'Data Structures',
            deadline: '2026-05-08T23:59:59',
            status: 'in-progress',
          },
        ];

        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Assignment',
            message: 'Database Design Project has been assigned',
            type: 'assignment',
            timestamp: '2026-05-07T10:30:00',
            read: false,
          },
          {
            id: '2',
            title: 'Deadline Reminder',
            message: 'Algorithm Analysis due in 2 days',
            type: 'deadline',
            timestamp: '2026-05-07T09:00:00',
            read: false,
          },
        ];

        const mockAIReminders: AIReminder[] = [
          {
            id: '1',
            message: 'You have 2 assignments due this week',
            type: 'deadline',
            priority: 'high',
          },
          {
            id: '2',
            message: 'Database assignment deadline is tomorrow',
            type: 'assignment',
            priority: 'high',
          },
          {
            id: '3',
            message: 'Review Chapter 5 for upcoming exam',
            type: 'study',
            priority: 'medium',
          },
        ];

        setStats(mockStats);
        setRecentAssignments(mockAssignments);
        setNotifications(mockNotifications);
        setAiReminders(mockAIReminders);
        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const getProgressPercentage = () => {
    if (stats.totalAssignments === 0) return 0;
    return Math.round((stats.completedAssignments / stats.totalAssignments) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'late': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

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
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Student'}!
        </h1>
        <p className="text-gray-600">Here's your academic progress overview</p>
      </motion.div>

      {/* Summary Cards */}
      <StaggerContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedCard delay={0.1}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </GlassCard>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgressAssignments}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </GlassCard>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </GlassCard>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingExams}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </GlassCard>
          </AnimatedCard>
        </div>
      </StaggerContainer>

      <StaggerContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Overview */}
          <AnimatedCard delay={0.5}>
            <GlassCard className="lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium">{getProgressPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className="bg-blue-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage()}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.pendingAssignments}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.inProgressAssignments}</div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Assignments */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Assignments</h4>
                <div className="space-y-2">
                  {recentAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{assignment.title}</p>
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    <AlertTriangle className={`w-4 h-4 ${assignment.status === 'late' ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </AnimatedCard>

          {/* AI Reminder Panel */}
          <AnimatedCard delay={0.7}>
            <GlassCard>
              <div className="flex items-center mb-4">
                <Brain className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              </div>

              <div className="space-y-3">
                {aiReminders.map((reminder, index) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (index * 0.1), duration: 0.3 }}
                    className={`p-3 rounded-lg border-l-4 ${getPriorityColor(reminder.priority)}`}
                  >
                    <p className="text-sm font-medium text-gray-900">{reminder.message}</p>
                    <span className={`text-xs font-medium ${
                      reminder.priority === 'high' ? 'text-red-600' :
                      reminder.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {reminder.priority.toUpperCase()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedCard>
        </div>
      </StaggerContainer>

      {/* Additional Widgets Row */}
      <StaggerContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <AnimatedCard delay={0.9}>
            <GlassCard>
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              </div>

              <div className="space-y-3">
                {recentAssignments
                  .filter(a => a.status === 'pending' || a.status === 'in-progress')
                  .slice(0, 3)
                  .map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + (index * 0.1), duration: 0.3 }}
                      className="flex items-center justify-between"
                    >
                  <div>
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    new Date(assignment.deadline) < new Date() ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {new Date(assignment.deadline) < new Date() ? 'Overdue' : 'Due Soon'}
                  </div>
                    </motion.div>
                  ))}
              </div>
            </GlassCard>
          </AnimatedCard>

          {/* Recent Notifications */}
          <AnimatedCard delay={1.0}>
            <GlassCard>
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
              </div>

              <div className="space-y-3">
                {notifications.slice(0, 4).map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + (index * 0.1), duration: 0.3 }}
                    className="flex items-start space-x-3"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.read ? 'bg-gray-400' : 'bg-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedCard>
        </div>
      </StaggerContainer>
    </div>
  );
};

export default DashboardHome;
