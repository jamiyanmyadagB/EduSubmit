import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award, 
  Clock, 
  Users, 
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

import PremiumCard, { PremiumStatCard, PremiumFeatureCard, PremiumDashboardPanel } from '../components/ui/PremiumCard';
import ThemeToggle from '../components/ui/ThemeToggle';
import { NotificationProvider, NotificationBell, useRealtimeNotifications } from '../components/ui/NotificationSystem';
import LoadingSkeleton, { DashboardSkeleton } from '../components/ui/LoadingSkeleton';
import Analytics3DPanel from '../components/3D/Analytics3DPanel';

interface DashboardStats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageScore: number;
  totalStudents: number;
  activeCourses: number;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'not-started';
  score?: number;
  maxScore: number;
  progress: number;
}

export default function EnhancedStudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { showSuccess, showInfo, showWarning } = useRealtimeNotifications();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalAssignments: 45,
        completedAssignments: 32,
        pendingAssignments: 13,
        averageScore: 85.2,
        totalStudents: 1234,
        activeCourses: 6,
      });
      
      setAssignments([
        {
          id: '1',
          title: 'Advanced React Patterns',
          course: 'Web Development',
          dueDate: '2024-03-25',
          status: 'in-progress',
          progress: 65,
          maxScore: 100,
        },
        {
          id: '2',
          title: 'Database Design Principles',
          course: 'Database Systems',
          dueDate: '2024-03-28',
          status: 'completed',
          score: 92,
          progress: 100,
          maxScore: 100,
        },
        {
          id: '3',
          title: 'Machine Learning Basics',
          course: 'AI/ML',
          dueDate: '2024-04-01',
          status: 'not-started',
          progress: 0,
          maxScore: 100,
        },
      ]);
      
      setIsLoading(false);
      showSuccess('Welcome back!', 'Your dashboard has been updated with latest data.');
    }, 1500);
  }, [showSuccess]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'in-progress': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'not-started': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
  } as const;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">EduSubmit</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Student Dashboard</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <NotificationBell />
                <ThemeToggle />
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">John Doe</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* 3D Analytics Panel */}
            <motion.div variants={itemVariants}>
              <PremiumDashboardPanel
                title="Real-time Analytics"
                subtitle="Interactive 3D visualization of your academic performance"
              >
                <Analytics3DPanel />
              </PremiumDashboardPanel>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumStatCard
                  title="Total Assignments"
                  value={stats?.totalAssignments.toString() || '0'}
                  change={12.5}
                  icon={<BookOpen className="w-5 h-5" />}
                  trend="up"
                  variant="default"
                />
                
                <PremiumStatCard
                  title="Completed"
                  value={stats?.completedAssignments.toString() || '0'}
                  change={8.3}
                  icon={<Award className="w-5 h-5" />}
                  trend="up"
                  variant="success"
                />
                
                <PremiumStatCard
                  title="Average Score"
                  value={`${stats?.averageScore.toFixed(1)}%`}
                  change={5.7}
                  icon={<TrendingUp className="w-5 h-5" />}
                  trend="up"
                  variant="default"
                />
                
                <PremiumStatCard
                  title="Pending"
                  value={stats?.pendingAssignments.toString() || '0'}
                  change={-2.1}
                  icon={<Clock className="w-5 h-5" />}
                  trend="down"
                  variant="warning"
                />
              </div>
            </motion.div>

            {/* Recent Assignments */}
            <motion.div variants={itemVariants}>
              <PremiumDashboardPanel
                title="Recent Assignments"
                subtitle="Track your progress and upcoming deadlines"
                actions={
                  <div className="flex items-center space-x-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="not-started">Not Started</option>
                    </select>
                    
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredAssignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PremiumCard variant="glass" hover className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {assignment.title}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                                  {assignment.status.replace('-', ' ')}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span className="flex items-center space-x-1">
                                  <BookOpen className="w-4 h-4" />
                                  <span>{assignment.course}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{assignment.dueDate}</span>
                                </span>
                                {assignment.score !== undefined && (
                                  <span className="flex items-center space-x-1">
                                    <Award className="w-4 h-4" />
                                    <span>{assignment.score}/{assignment.maxScore}</span>
                                  </span>
                                )}
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <motion.div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${assignment.progress}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </PremiumCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </PremiumDashboardPanel>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <PremiumDashboardPanel
                title="Quick Actions"
                subtitle="Common tasks and features"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <PremiumFeatureCard
                    title="Submit Assignment"
                    description="Upload and submit your completed assignments"
                    icon={<Upload className="w-6 h-6" />}
                    action={{
                      label: 'Submit Now',
                      onClick: () => showInfo('Submit Assignment', 'Opening submission form...'),
                    }}
                  />
                  
                  <PremiumFeatureCard
                    title="View Progress"
                    description="Track your academic performance and grades"
                    icon={<BarChart3 className="w-6 h-6" />}
                    action={{
                      label: 'View Details',
                      onClick: () => showInfo('Progress Report', 'Loading your progress data...'),
                    }}
                  />
                  
                  <PremiumFeatureCard
                    title="AI Assistant"
                    description="Get help with assignments and study materials"
                    icon={<Users className="w-6 h-6" />}
                    badge="New"
                    status="beta"
                  />
                </div>
              </PremiumDashboardPanel>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </NotificationProvider>
  );
}
