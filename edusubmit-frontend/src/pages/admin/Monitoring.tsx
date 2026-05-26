import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Shield,
  Server,
  Cpu,
  Database,
  Activity,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  BarChart3,
  HardDrive,
  Wifi,
  Zap
} from 'lucide-react';

interface SystemHealth {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  redis: 'healthy' | 'degraded' | 'down';
  gateway: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
}

interface ServiceMetrics {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  responseTime: number;
  requests: number;
  errors: number;
  cpuUsage: number;
  memoryUsage: number;
  lastChecked: string;
}

interface FailedRequest {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  error: string;
  userId?: string;
  ip?: string;
}

const Monitoring = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: 'healthy',
    database: 'healthy',
    redis: 'healthy',
    gateway: 'healthy',
    storage: 'healthy'
  });
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics[]>([]);
  const [failedRequests, setFailedRequests] = useState<FailedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch monitoring data
    const fetchMonitoringData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockSystemHealth: SystemHealth = {
          api: 'healthy',
          database: 'healthy',
          redis: 'healthy',
          gateway: 'healthy',
          storage: 'degraded'
        };

        const mockServiceMetrics: ServiceMetrics[] = [
          {
            name: 'API Gateway',
            status: 'healthy',
            uptime: '99.9%',
            responseTime: 245,
            requests: 1250,
            errors: 3,
            cpuUsage: 45,
            memoryUsage: 67,
            lastChecked: new Date().toISOString()
          },
          {
            name: 'Auth Service',
            status: 'healthy',
            uptime: '99.7%',
            responseTime: 180,
            requests: 890,
            errors: 1,
            cpuUsage: 32,
            memoryUsage: 58,
            lastChecked: new Date().toISOString()
          },
          {
            name: 'Database Service',
            status: 'healthy',
            uptime: '99.8%',
            responseTime: 120,
            requests: 450,
            errors: 0,
            cpuUsage: 28,
            memoryUsage: 45,
            lastChecked: new Date().toISOString()
          },
          {
            name: 'Redis Cache',
            status: 'degraded',
            uptime: '98.5%',
            responseTime: 95,
            requests: 2100,
            errors: 12,
            cpuUsage: 78,
            memoryUsage: 82,
            lastChecked: new Date().toISOString()
          },
          {
            name: 'File Storage',
            status: 'degraded',
            uptime: '97.2%',
            responseTime: 450,
            requests: 680,
            errors: 8,
            cpuUsage: 65,
            memoryUsage: 71,
            lastChecked: new Date().toISOString()
          }
        ];

        const mockFailedRequests: FailedRequest[] = [
          {
            id: '1',
            timestamp: '2026-05-07T14:30:15',
            endpoint: '/api/auth/login',
            method: 'POST',
            status: 500,
            error: 'Database connection timeout',
            userId: 'user123',
            ip: '192.168.1.100'
          },
          {
            id: '2',
            timestamp: '2026-05-07T14:25:32',
            endpoint: '/api/assignments',
            method: 'GET',
            status: 403,
            error: 'Insufficient permissions',
            userId: 'user456',
            ip: '192.168.1.101'
          },
          {
            id: '3',
            timestamp: '2026-05-07T14:20:45',
            endpoint: '/api/submissions',
            method: 'POST',
            status: 429,
            error: 'Rate limit exceeded',
            userId: 'user789',
            ip: '192.168.1.102'
          },
          {
            id: '4',
            timestamp: '2026-05-07T14:15:22',
            endpoint: '/api/users',
            method: 'PUT',
            status: 400,
            error: 'Invalid email domain',
            userId: 'user321',
            ip: '192.168.1.103'
          },
          {
            id: '5',
            timestamp: '2026-05-07T14:10:18',
            endpoint: '/api/files/upload',
            method: 'POST',
            status: 413,
            error: 'File size exceeds limit',
            userId: 'user654',
            ip: '192.168.1.104'
          }
        ];

        setSystemHealth(mockSystemHealth);
        setServiceMetrics(mockServiceMetrics);
        setFailedRequests(mockFailedRequests);
        setLoading(false);
      }, 1500);
    };

    fetchMonitoringData();
  }, []);

  useEffect(() => {
    // Auto-refresh functionality
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh monitoring data
      const fetchMonitoringData = async () => {
        setRefreshing(true);
        
        setTimeout(() => {
          // Simulate API calls to refresh data
          setServiceMetrics(prev => prev.map(service => ({
            ...service,
            lastChecked: new Date().toISOString(),
            responseTime: Math.max(50, service.responseTime + Math.random() * 100 - 50),
            requests: service.requests + Math.floor(Math.random() * 10),
            errors: service.errors + Math.floor(Math.random() * 2)
          })));
          
          setRefreshing(false);
        }, 1000);
      };

      fetchMonitoringData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'down': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    setTimeout(() => {
      // Simulate API calls to refresh data
      setServiceMetrics(prev => prev.map(service => ({
        ...service,
        lastChecked: new Date().toISOString(),
        responseTime: Math.max(50, service.responseTime + Math.random() * 100 - 50),
        requests: service.requests + Math.floor(Math.random() * 10),
        errors: service.errors + Math.floor(Math.random() * 2)
      })));
      
      setRefreshing(false);
    }, 1000);
  };

  const handleClearFailedRequests = () => {
    // In real app, this would call API to clear failed requests
    setFailedRequests([]);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Monitor platform health and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-600">
              Auto Refresh ({refreshInterval}s)
            </label>
          </div>

          {/* Refresh Interval */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Interval:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              disabled={!autoRefresh}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
              <option value={120}>120s</option>
              <option value={300}>300s</option>
            </select>
          </div>

          {/* Manual Refresh */}
          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </motion.button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">API Gateway</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(systemHealth.api)}`}>
                {systemHealth.api.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.api)}`}>
                {getStatusIcon(systemHealth.api)}
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
                {getStatusIcon(systemHealth.database)}
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
                {getStatusIcon(systemHealth.redis)}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(systemHealth.storage)}`}>
                STORAGE
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.storage)}`}>
                {getStatusIcon(systemHealth.storage)}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Service Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Service Metrics</h3>
              <motion.button
                onClick={handleRefresh}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </motion.button>
            </div>

            <div className="space-y-4">
              {serviceMetrics.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${getHealthStatusColor(service.status)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getHealthStatusColor(service.status)} p-2`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">
                          Last checked: {new Date(service.lastChecked).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(service.status)}`}>
                      {service.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="text-lg font-bold text-gray-900">{service.uptime}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="text-lg font-bold text-gray-900">{service.responseTime}ms</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Requests</p>
                      <p className="text-lg font-bold text-gray-900">{service.requests}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Errors</p>
                      <p className="text-lg font-bold text-red-600">{service.errors}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">CPU Usage</p>
                      <p className="text-lg font-bold text-gray-900">{service.cpuUsage}%</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Memory Usage</p>
                      <p className="text-lg font-bold text-gray-900">{service.memoryUsage}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Performance Overview */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceMetrics.reduce((sum, service) => sum + service.requests, 0)}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(serviceMetrics.reduce((sum, service) => sum + service.responseTime, 0) / serviceMetrics.length)}ms
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Server className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {serviceMetrics.reduce((sum, service) => sum + service.errors, 0)}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <HardDrive className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Storage Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(serviceMetrics.reduce((sum, service) => sum + (service.cpuUsage + service.memoryUsage) / 2, 0) / serviceMetrics.length)}%
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Failed Requests */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Failed Requests</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {failedRequests.length} recent failures
              </span>
              
              <motion.button
                onClick={handleClearFailedRequests}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Clear All
              </motion.button>
            </div>
          </div>

          <div className="space-y-3">
            {failedRequests.slice(0, 10).map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {request.status}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(request.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <p className="font-medium text-gray-900">
                        {request.method} {request.endpoint}
                      </p>
                      <p className="text-sm text-gray-600">{request.error}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {request.userId && (
                        <span>User: {request.userId}</span>
                      )}
                      {request.ip && (
                        <span>IP: {request.ip}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {failedRequests.length > 10 && (
            <div className="text-center mt-4">
              <motion.button
                onClick={() => {
                  // In real app, this would show all failed requests
                  console.log('Show all failed requests');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Failed Requests
              </motion.button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Monitoring;
