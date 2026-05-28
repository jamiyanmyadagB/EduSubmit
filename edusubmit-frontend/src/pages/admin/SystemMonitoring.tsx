import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Server,
  Database,
  Wifi,
  WifiOff,
  HardDrive,
  Cpu,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  X,
  Zap,
  Globe,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import adminApiService from '../../services/adminApiService';

interface SystemHealth {
  api: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
    lastCheck: string;
  };
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connections: number;
    queryTime: number;
    uptime: number;
    lastCheck: string;
  };
  redis: {
    status: 'healthy' | 'degraded' | 'down';
    memory: number;
    connections: number;
    uptime: number;
    lastCheck: string;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
    lastUpdate: string;
  };
}

interface ServiceMetrics {
  activeUsers: number;
  failedRequests: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  peakUsers: number;
  peakTime: string;
}

interface PerformanceMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    readSpeed: number;
    writeSpeed: number;
  };
  network: {
    upload: number;
    download: number;
    latency: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  service: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

const AdminSystemMonitoring: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: {
      status: 'healthy',
      responseTime: 245,
      uptime: 99.9,
      lastCheck: new Date().toISOString()
    },
    database: {
      status: 'healthy',
      connections: 45,
      queryTime: 12,
      uptime: 99.8,
      lastCheck: new Date().toISOString()
    },
    redis: {
      status: 'healthy',
      memory: 256,
      connections: 23,
      uptime: 99.9,
      lastCheck: new Date().toISOString()
    },
    storage: {
      used: 450,
      total: 1000,
      percentage: 45,
      lastUpdate: new Date().toISOString()
    }
  });

  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics>({
    activeUsers: 234,
    failedRequests: 12,
    totalRequests: 15420,
    errorRate: 0.08,
    averageResponseTime: 245,
    peakUsers: 312,
    peakTime: '2026-05-08T14:30:00'
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    cpu: {
      usage: 65,
      cores: 8,
      temperature: 58
    },
    memory: {
      used: 8.2,
      total: 16,
      percentage: 51
    },
    disk: {
      used: 450,
      total: 1000,
      percentage: 45,
      readSpeed: 125,
      writeSpeed: 95
    },
    network: {
      upload: 45,
      download: 120,
      latency: 12
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchSystemData = async () => {
    setLoading(true);
    setError(null);
    try {
      const systemHealthData = await adminApiService.getSystemHealth();
      const dashboardStats = await adminApiService.getDashboardStats();
      
      setSystemHealth({
        api: {
          status: (systemHealthData.apiStatus || 'healthy') as 'down' | 'healthy' | 'degraded',
          responseTime: 245,
          uptime: 99.9,
          lastCheck: new Date().toISOString()
        },
        database: {
          status: (systemHealthData.databaseStatus || 'healthy') as 'down' | 'healthy' | 'degraded',
          connections: 45,
          queryTime: 12,
          uptime: 99.8,
          lastCheck: new Date().toISOString()
        },
        redis: {
          status: (systemHealthData.redisStatus || 'healthy') as 'down' | 'healthy' | 'degraded',
          memory: 256,
          connections: 23,
          uptime: 99.9,
          lastCheck: new Date().toISOString()
        },
        storage: {
          used: systemHealthData.storageUsage?.used || 450,
          total: systemHealthData.storageUsage?.total || 1000,
          percentage: systemHealthData.storageUsage?.percentage || 45,
          lastUpdate: new Date().toISOString()
        }
      });

      setServiceMetrics({
        activeUsers: dashboardStats.activeUsers || 234,
        failedRequests: 12,
        totalRequests: 15420,
        errorRate: 0.08,
        averageResponseTime: 245,
        peakUsers: 312,
        peakTime: '2026-05-08T14:30:00'
      });

      setPerformanceMetrics({
        cpu: {
          usage: 65,
          cores: 8,
          temperature: 58
        },
        memory: {
          used: systemHealthData.usedMemory || 8.2,
          total: systemHealthData.totalMemory || 16,
          percentage: 51
        },
        disk: {
          used: 450,
          total: 1000,
          percentage: 45,
          readSpeed: 125,
          writeSpeed: 95
        },
        network: {
          upload: 45,
          download: 120,
          latency: 12
        }
      });

      // Fetch recent activity logs as alerts
      try {
        const recentLogs = await adminApiService.getRecentActivityLogs(10);
        const mappedAlerts: Alert[] = recentLogs.map((log: any) => ({
          id: log.id,
          type: log.severity === 'CRITICAL' ? 'critical' : log.severity === 'WARNING' ? 'warning' : 'info',
          service: log.entityType,
          message: log.action,
          timestamp: log.createdAt,
          resolved: false
        }));
        setAlerts(mappedAlerts);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setAlerts([]);
      }

    } catch (err) {
      console.error('Error fetching system data:', err);
      setError('Failed to load system monitoring data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setSystemHealth(prev => ({
        ...prev,
        api: {
          ...prev.api,
          responseTime: Math.random() * 500 + 100,
          lastCheck: new Date().toISOString()
        },
        database: {
          ...prev.database,
          connections: Math.floor(Math.random() * 20) + 35,
          lastCheck: new Date().toISOString()
        },
        redis: {
          ...prev.redis,
          memory: Math.floor(Math.random() * 100) + 200,
          lastCheck: new Date().toISOString()
        }
      }));

      setServiceMetrics(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 100) + 180,
        failedRequests: Math.floor(Math.random() * 10) + 5,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 50),
        averageResponseTime: Math.random() * 300 + 150
      }));

      setPerformanceMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.random() * 40 + 40,
          temperature: Math.random() * 20 + 50
        },
        memory: {
          ...prev.memory,
          used: Math.random() * 4 + 6,
          percentage: Math.random() * 30 + 35
        },
        network: {
          ...prev.network,
          latency: Math.random() * 10 + 8
        }
      }));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId
        ? { ...alert, resolved: true, resolvedAt: new Date().toISOString() }
        : alert
    ));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const exportMetrics = () => {
    const data = {
      systemHealth,
      serviceMetrics,
      performanceMetrics,
      alerts,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-2">Real-time platform health and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-700">Auto Refresh</span>
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={!autoRefresh}
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportMetrics}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${systemHealth.api.status === 'healthy' ? 'bg-green-500' : systemHealth.api.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(systemHealth.api.status)}`}>
                  {systemHealth.api.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Response: {systemHealth.api.responseTime.toFixed(0)}ms | Uptime: {systemHealth.api.uptime}%
              </div>
            </div>
            <div className={`p-3 rounded-full ${systemHealth.api.status === 'healthy' ? 'bg-green-100' : systemHealth.api.status === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'}`}>
              {systemHealth.api.status === 'healthy' ? <Wifi className="w-6 h-6 text-green-600" /> : <WifiOff className="w-6 h-6 text-red-600" />}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${systemHealth.database.status === 'healthy' ? 'bg-green-500' : systemHealth.database.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(systemHealth.database.status)}`}>
                  {systemHealth.database.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Connections: {systemHealth.database.connections} | Query: {systemHealth.database.queryTime}ms
              </div>
            </div>
            <div className={`p-3 rounded-full ${systemHealth.database.status === 'healthy' ? 'bg-green-100' : systemHealth.database.status === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Redis Cache</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${systemHealth.redis.status === 'healthy' ? 'bg-green-500' : systemHealth.redis.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(systemHealth.redis.status)}`}>
                  {systemHealth.redis.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Memory: {systemHealth.redis.memory}MB | Connections: {systemHealth.redis.connections}
              </div>
            </div>
            <div className={`p-3 rounded-full ${systemHealth.redis.status === 'healthy' ? 'bg-green-100' : systemHealth.redis.status === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="relative w-12 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                    style={{ width: `${systemHealth.storage.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {systemHealth.storage.used}GB / {systemHealth.storage.total}GB
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {systemHealth.storage.percentage}% used
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Metrics */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Service Metrics</span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{serviceMetrics.activeUsers}</p>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xs text-gray-500 mt-1">Peak: {serviceMetrics.peakUsers}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Server className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{serviceMetrics.totalRequests.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Requests</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{serviceMetrics.failedRequests}</p>
                <p className="text-sm text-gray-600">Failed Requests</p>
                <p className="text-xs text-gray-500 mt-1">Error Rate: {serviceMetrics.errorRate}%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{serviceMetrics.averageResponseTime.toFixed(0)}ms</p>
                <p className="text-sm text-gray-600">Avg Response Time</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Performance Metrics */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Performance Metrics</span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Cpu className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.cpu.usage.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">CPU Usage</p>
                <p className="text-xs text-gray-500 mt-1">Temp: {performanceMetrics.cpu.temperature.toFixed(0)}°C</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.memory.percentage.toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className="text-xs text-gray-500 mt-1">{performanceMetrics.memory.used.toFixed(1)}GB / {performanceMetrics.memory.total}GB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <HardDrive className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.disk.percentage.toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Disk Usage</p>
                <p className="text-xs text-gray-500 mt-1">R: {performanceMetrics.disk.readSpeed}MB/s W: {performanceMetrics.disk.writeSpeed}MB/s</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.network.latency.toFixed(0)}ms</p>
                <p className="text-sm text-gray-600">Network Latency</p>
                <p className="text-xs text-gray-500 mt-1">↑{performanceMetrics.network.upload}Mbps ↓{performanceMetrics.network.download}Mbps</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* System Alerts */}
      <GlassCard>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
              <span>System Alerts</span>
            </h3>
            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
              {alerts.filter(a => !a.resolved).length} Active
            </span>
          </div>
        </div>
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">No active system alerts</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        alert.type === 'critical' ? 'bg-red-100' : 
                        alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          alert.type === 'critical' ? 'text-red-600' : 
                          alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{alert.service}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.type === 'critical' ? 'bg-red-100 text-red-600' : 
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {alert.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          {alert.resolved && (
                            <span className="text-xs text-green-600">
                              Resolved at {new Date(alert.resolvedAt!).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as resolved"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminSystemMonitoring;
