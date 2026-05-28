import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Users,
  BookOpen,
  Calendar,
  Shield,
  Activity,
  Database,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Server,
  Cpu,
  UserCheck,
  Settings,
  Bell
} from 'lucide-react';

interface SystemHealth {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  redis: 'healthy' | 'degraded' | 'down';
  gateway: 'healthy' | 'degraded' | 'down';
}

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSections: number;
  activeStudents: number;
  activeTeachers: number;
  totalAssignments: number;
  pendingSubmissions: number;
  systemUptime: string;
  storageUsage: number;
  failedRequests: number;
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'user_disabled' | 'section_created' | 'assignment_created' | 'submission_reviewed';
  description: string;
  timestamp: string;
  user?: string;
  details?: any;
}

interface PlatformMetrics {
  activeUsers: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  storageUsed: number;
  bandwidthUsed: number;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: 'healthy',
    database: 'healthy',
    redis: 'healthy',
    gateway: 'healthy'
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch admin dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockStats: DashboardStats = {
          totalStudents: 75,
          totalTeachers: 8,
          totalSections: 12,
          activeStudents: 68,
          activeTeachers: 7,
          totalAssignments: 45,
          pendingSubmissions: 12,
          systemUptime: '99.9%',
          storageUsage: 67,
          failedRequests: 3
        };

        const mockSystemHealth: SystemHealth = {
          api: 'healthy',
          database: 'healthy',
          redis: 'healthy',
          gateway: 'healthy'
        };

        const mockRecentActivities: RecentActivity[] = [
          {
            id: '1',
            type: 'user_created',
            description: 'New student John Doe created and assigned to CS-A section',
            timestamp: '2026-05-07T10:30:00',
            user: 'admin'
          },
          {
            id: '2',
            type: 'section_created',
            description: 'New section CS-D created with 18 students',
            timestamp: '2026-05-06T14:20:00',
            user: 'admin'
          },
          {
            id: '3',
            type: 'assignment_created',
            description: 'Teacher Sarah Johnson created "Database Design Project" for CS-A',
            timestamp: '2026-05-05T16:45:00',
            user: 'sarah.johnson@lpu.in'
          },
          {
            id: '4',
            type: 'submission_reviewed',
            description: 'Admin reviewed 5 submissions from Algorithm Analysis assignment',
            timestamp: '2026-05-07T14:15:00',
            user: 'admin'
          },
          {
            id: '5',
            type: 'user_disabled',
            description: 'Student Mike Johnson account disabled due to inactivity',
            timestamp: '2026-05-06T11:30:00',
            user: 'admin'
          }
        ];

        const mockPlatformMetrics: PlatformMetrics = {
          activeUsers: 45,
          totalRequests: 1250,
          averageResponseTime: 245,
          errorRate: 0.8,
          storageUsed: 67,
          bandwidthUsed: 42
        };

        setStats(mockStats);
        setSystemHealth(mockSystemHealth);
        setRecentActivities(mockRecentActivities);
        setPlatformMetrics(mockPlatformMetrics);
        setLoading(false);
      }, 1500);
    };

    fetchDashboardData();
  }, []);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created': return <Users className="w-4 h-4 text-green-600" />;
      case 'user_disabled': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'section_created': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'assignment_created': return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'submission_reviewed': return <CheckCircle className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_created': return 'text-green-700 bg-green-50 border-green-200';
      case 'user_disabled': return 'text-red-700 bg-red-50 border-red-200';
      case 'section_created': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'assignment_created': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'submission_reviewed': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform operations and monitor system health</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(systemHealth.api)}`}>
                API
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.api)}`}>
                {systemHealth.api.toUpperCase()}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Database</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(systemHealth.database)}`}>
                DB
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.database)}`}>
                {systemHealth.database.toUpperCase()}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Redis Cache</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(systemHealth.redis)}`}>
                REDIS
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.redis)}`}>
                {systemHealth.redis.toUpperCase()}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">API Gateway</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(systemHealth.gateway)}`}>
                GW
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.gateway)}`}>
                {systemHealth.gateway.toUpperCase()}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalTeachers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sections</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalSections || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeStudents || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalAssignments || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingSubmissions || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.systemUptime || 'N/A'}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.failedRequests || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Usage</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.storageUsage || 0}%</p>
              </div>
              <Database className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Activity
              </motion.button>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getActivityColor(activity.type)} p-2`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{activity.description}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {activity.user && (
                      <div className="text-xs text-gray-600">
                        by {activity.user}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Platform Metrics */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Platform Metrics</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Detailed Analytics
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">Active Users</div>
              <div className="text-2xl font-bold text-gray-900">{platformMetrics?.activeUsers || 0}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Requests</div>
              <div className="text-2xl font-bold text-gray-900">{platformMetrics?.totalRequests || 0}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">Avg Response Time</div>
              <div className="text-2xl font-bold text-gray-900">{platformMetrics?.averageResponseTime || 0}ms</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">Error Rate</div>
              <div className="text-2xl font-bold text-gray-900">{platformMetrics?.errorRate || 0}%</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">Storage Used</div>
              <div className="text-2xl font-bold text-gray-900">{platformMetrics?.storageUsed || 0}%</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">Bandwidth Used</div>
              <div className="text-2xl font-bold text-gray-900">{platformMetrics?.bandwidthUsed || 0}GB</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-sm text-gray-900">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
