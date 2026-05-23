import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import adminApiService from '../../services/adminApiService';
import { 
  Users,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Server,
  Wifi,
  WifiOff,
  UserPlus,
  UserMinus,
  BarChart3,
  Clock,
  Shield,
  Cpu,
  HardDrive,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeSections: number;
  activeAssignments: number;
  pendingIssues: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'user_disabled' | 'section_created' | 'role_changed' | 'system_alert';
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface SectionOverview {
  id: string;
  name: string;
  studentCount: number;
  teacherCount: number;
  activeAssignments: number;
  averagePerformance: number;
  status: 'active' | 'archived';
}

interface TeacherAllocation {
  id: string;
  name: string;
  email: string;
  sections: string[];
  activeAssignments: number;
  totalStudents: number;
  workload: 'optimal' | 'heavy' | 'light';
}

interface AssignmentStats {
  total: number;
  active: number;
  completed: number;
  bySubject: Array<{
    subject: string;
    count: number;
    percentage: number;
  }>;
  bySection: Array<{
    section: string;
    count: number;
    percentage: number;
  }>;
}

interface SystemHealth {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  redis: 'healthy' | 'degraded' | 'down';
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  activeUsers: number;
  failedRequests: number;
}

const AdminDashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeSections: 0,
    activeAssignments: 0,
    pendingIssues: 0,
    systemHealth: 'healthy'
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [sectionOverview, setSectionOverview] = useState<SectionOverview[]>([]);
  const [teacherAllocations, setTeacherAllocations] = useState<TeacherAllocation[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats>({
    total: 0,
    active: 0,
    completed: 0,
    bySubject: [],
    bySection: []
  });
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: 'healthy',
    database: 'healthy',
    redis: 'healthy',
    storage: { used: 0, total: 0, percentage: 0 },
    uptime: 99.9,
    activeUsers: 0,
    failedRequests: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [dashboardStats, systemHealthData] = await Promise.all([
          adminApiService.getDashboardStats(),
          adminApiService.getSystemHealth()
        ]);

        setStats({
          totalStudents: dashboardStats.totalStudents || 0,
          totalTeachers: dashboardStats.totalTeachers || 0,
          activeSections: 0, // Will be fetched from sections endpoint
          activeAssignments: 0, // Will be fetched from assignments endpoint
          pendingIssues: 0, // Will be calculated from activity logs
          systemHealth: (dashboardStats.systemHealth || 'healthy') as 'healthy' | 'warning' | 'critical'
        });

        setRecentActivities(dashboardStats.recentActivities || []);
        setSystemHealth({
          api: (systemHealthData.apiStatus || 'healthy') as 'down' | 'healthy' | 'degraded',
          database: (systemHealthData.databaseStatus || 'healthy') as 'down' | 'healthy' | 'degraded',
          redis: (systemHealthData.redisStatus || 'healthy') as 'down' | 'healthy' | 'degraded',
          storage: systemHealthData.storageUsage || { used: 0, total: 0, percentage: 0 },
          uptime: systemHealthData.uptime || 0,
          activeUsers: dashboardStats.activeUsers || 0,
          failedRequests: 0
        });

        // Fetch additional data
        try {
          const sections = await adminApiService.getAllDepartments(0, 10, 'name', 'asc');
          setSectionOverview(sections.content.map((dept: any) => ({
            id: dept.id,
            name: dept.name,
            studentCount: 0, // Will be calculated from users
            teacherCount: 0, // Will be calculated from users
            activeAssignments: 0,
            averagePerformance: 0,
            status: dept.status.toLowerCase()
          })));
        } catch (err) {
          console.error('Error fetching sections:', err);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created': return UserPlus;
      case 'user_disabled': return UserMinus;
      case 'section_created': return BookOpen;
      case 'role_changed': return Shield;
      case 'system_alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'heavy': return 'text-red-600 bg-red-100';
      case 'light': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and management analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers.toLocaleString()}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSections}</p>
            </div>
            <Database className="w-8 h-8 text-purple-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingIssues}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(stats.systemHealth)}`}>
                {stats.systemHealth.toUpperCase()}
              </span>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Recent User Activity</span>
            </h3>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`p-2 rounded-full ${activity.type === 'system_alert' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Icon className={`w-4 h-4 ${activity.type === 'system_alert' ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">by {activity.user}</p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Section Overview */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span>Section Overview</span>
            </h3>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {sectionOverview.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{section.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      section.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {section.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {section.averagePerformance.toFixed(1)}% avg
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{section.studentCount} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{section.teacherCount} teachers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{section.activeAssignments} assignments</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Allocation Overview */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Teacher Allocation Overview</span>
            </h3>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {teacherAllocations.map((teacher) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{teacher.name}</h4>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(teacher.workload)}`}>
                    {teacher.workload}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{teacher.sections.length} sections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{teacher.totalStudents} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{teacher.activeAssignments} assignments</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {teacher.sections.map((section, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {section}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Assignment Statistics */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Assignment Statistics</span>
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{assignmentStats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{assignmentStats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{assignmentStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">By Subject</h4>
              <div className="space-y-2">
                {assignmentStats.bySubject.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{subject.subject}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{subject.count}</span>
                      <span className="text-xs text-gray-500">({subject.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Platform Health Indicators */}
      <GlassCard>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Server className="w-5 h-5 text-purple-600" />
            <span>Platform Health Indicators</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getHealthColor(systemHealth.api)}`}>
                <Wifi className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">API Status</p>
              <p className={`text-xs font-medium ${getHealthColor(systemHealth.api)}`}>
                {systemHealth.api.toUpperCase()}
              </p>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getHealthColor(systemHealth.database)}`}>
                <Database className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className={`text-xs font-medium ${getHealthColor(systemHealth.database)}`}>
                {systemHealth.database.toUpperCase()}
              </p>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getHealthColor(systemHealth.redis)}`}>
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">Redis Cache</p>
              <p className={`text-xs font-medium ${getHealthColor(systemHealth.redis)}`}>
                {systemHealth.redis.toUpperCase()}
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-blue-100">
                <HardDrive className="w-6 h-6 text-blue-600" />
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${systemHealth.storage.percentage}%` }}
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">Storage</p>
              <p className="text-xs text-gray-600">
                {systemHealth.storage.used}GB / {systemHealth.storage.total}GB
              </p>
              <p className="text-xs font-medium text-blue-600">
                {systemHealth.storage.percentage}% used
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Cpu className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{systemHealth.uptime}%</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{systemHealth.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{systemHealth.failedRequests}</p>
              <p className="text-sm text-gray-600">Failed Requests</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminDashboardHome;
