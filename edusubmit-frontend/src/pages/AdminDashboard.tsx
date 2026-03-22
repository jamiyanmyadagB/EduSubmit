import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedChart from '../components/charts/AnimatedChart';
import AnimatedBackground from '../components/3D/AnimatedBackground';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Settings,
  Shield,
  Activity,
  BookOpen,
  Clock
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  assignmentsCompleted?: number;
  assignmentsCreated?: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalAssignments: number;
  pendingSubmissions: number;
  systemHealth: number;
  storageUsed: number;
  storageTotal: number;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
    systemHealth: 0,
    storageUsed: 0,
    storageTotal: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('all');

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'STUDENT',
          status: 'active',
          lastLogin: '2024-03-20',
          assignmentsCompleted: 12
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'TEACHER',
          status: 'active',
          lastLogin: '2024-03-19',
          assignmentsCreated: 8
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'STUDENT',
          status: 'inactive',
          lastLogin: '2024-03-15',
          assignmentsCompleted: 5
        },
        {
          id: '4',
          name: 'Sarah Williams',
          email: 'sarah@example.com',
          role: 'ADMIN',
          status: 'active',
          lastLogin: '2024-03-20'
        }
      ]);

      setStats({
        totalUsers: 245,
        activeUsers: 198,
        totalAssignments: 1247,
        pendingSubmissions: 34,
        systemHealth: 98,
        storageUsed: 67,
        storageTotal: 100
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  const chartData = [
    { name: 'Mon', value: 45, submissions: 12, users: 180 },
    { name: 'Tue', value: 52, submissions: 15, users: 195 },
    { name: 'Wed', value: 38, submissions: 8, users: 175 },
    { name: 'Thu', value: 65, submissions: 22, users: 210 },
    { name: 'Fri', value: 48, submissions: 18, users: 188 },
    { name: 'Sat', value: 28, submissions: 6, users: 120 },
    { name: 'Sun', value: 35, submissions: 9, users: 145 }
  ];

  const roleDistribution = [
    { name: 'Students', value: 200 },
    { name: 'Teachers', value: 35 },
    { name: 'Admins', value: 10 }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full z-10"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">System overview and user management</p>
          </div>
          
          <div className="flex gap-3">
            <AnimatedButton variant="secondary" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </AnimatedButton>
            <AnimatedButton variant="primary" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </AnimatedButton>
          </div>
        </motion.div>

        {/* System Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-green-400 text-sm">{stats.activeUsers} active</p>
                </div>
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Assignments</p>
                  <p className="text-3xl font-bold text-white">{stats.totalAssignments}</p>
                  <p className="text-yellow-400 text-sm">{stats.pendingSubmissions} pending</p>
                </div>
                <FileText className="w-10 h-10 text-green-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">System Health</p>
                  <p className="text-3xl font-bold text-white">{stats.systemHealth}%</p>
                  <p className="text-green-400 text-sm">Optimal</p>
                </div>
                <Shield className="w-10 h-10 text-purple-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Storage Used</p>
                  <p className="text-3xl font-bold text-white">{stats.storageUsed}%</p>
                  <p className="text-blue-400 text-sm">{stats.storageTotal}GB total</p>
                </div>
                <Activity className="w-10 h-10 text-yellow-400" />
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <motion.div variants={itemVariants}>
            <AnimatedChart
              data={chartData}
              type="area"
              title="Weekly Activity"
              color="#3b82f6"
              height={300}
              dataKey="users"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedChart
              data={roleDistribution}
              type="pie"
              title="User Distribution"
              height={300}
            />
          </motion.div>
        </motion.div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                User Management
              </h2>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="TEACHER">Teachers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Login</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Activity</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
                          user.role === 'TEACHER' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-300' :
                          user.status === 'inactive' ? 'bg-gray-500/20 text-gray-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            user.status === 'active' ? 'bg-green-400' :
                            user.status === 'inactive' ? 'bg-gray-400' :
                            'bg-red-400'
                          }`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{user.lastLogin}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.role === 'STUDENT' && user.assignmentsCompleted && (
                            <span className="text-blue-400 text-sm">{user.assignmentsCompleted} completed</span>
                          )}
                          {user.role === 'TEACHER' && user.assignmentsCreated && (
                            <span className="text-green-400 text-sm">{user.assignmentsCreated} created</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <AnimatedButton variant="secondary" size="sm">
                            Edit
                          </AnimatedButton>
                          <AnimatedButton variant="primary" size="sm">
                            View
                          </AnimatedButton>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              System Alerts
            </h2>
            
            <div className="space-y-3">
              {[
                {
                  type: 'warning',
                  title: 'High Server Load',
                  description: 'CPU usage has exceeded 80% for the past 2 hours',
                  time: '5 minutes ago'
                },
                {
                  type: 'info',
                  title: 'Backup Completed',
                  description: 'Daily system backup completed successfully',
                  time: '1 hour ago'
                },
                {
                  type: 'success',
                  title: 'Security Scan',
                  description: 'Weekly security scan completed - no threats detected',
                  time: '3 hours ago'
                }
              ].map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    alert.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                    {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-400" />}
                    
                    <div>
                      <h3 className={`font-medium ${
                        alert.type === 'warning' ? 'text-yellow-300' :
                        alert.type === 'success' ? 'text-green-300' : 'text-blue-300'
                      }`}>
                        {alert.title}
                      </h3>
                      <p className="text-gray-300 text-sm">{alert.description}</p>
                    </div>
                  </div>
                  
                  <span className="text-gray-400 text-sm">{alert.time}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
