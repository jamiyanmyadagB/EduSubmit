import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  BookOpen,
  FileText,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  Eye
} from 'lucide-react';

interface DashboardStats {
  activeAssignments: number;
  pendingReviews: number;
  completedReviews: number;
  upcomingExams: number;
  lateSubmissions: number;
  totalStudents: number;
  averageGrade: number;
}

interface RecentSubmission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'graded';
  aiSuspicionScore?: number;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  submissionsCount: number;
  totalStudents: number;
}

interface SectionActivity {
  sectionName: string;
  studentCount: number;
  activeAssignments: number;
  pendingSubmissions: number;
  recentActivity: string;
}

interface AISuggestion {
  id: string;
  type: 'deadline' | 'workload' | 'grading' | 'scheduling';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeAssignments: 0,
    pendingReviews: 0,
    completedReviews: 0,
    upcomingExams: 0,
    lateSubmissions: 0,
    totalStudents: 0,
    averageGrade: 0,
  });

  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [sectionActivity, setSectionActivity] = useState<SectionActivity[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockStats: DashboardStats = {
          activeAssignments: 8,
          pendingReviews: 15,
          completedReviews: 32,
          upcomingExams: 3,
          lateSubmissions: 2,
          totalStudents: 45,
          averageGrade: 78.5,
        };

        const mockSubmissions: RecentSubmission[] = [
          {
            id: '1',
            studentName: 'John Doe',
            assignmentTitle: 'Database Design Project',
            submittedAt: '2026-05-07T14:30:00',
            status: 'pending',
            aiSuspicionScore: 0.12,
          },
          {
            id: '2',
            studentName: 'Jane Smith',
            assignmentTitle: 'Algorithm Analysis',
            submittedAt: '2026-05-07T16:45:00',
            status: 'graded',
            aiSuspicionScore: 0.05,
          },
          {
            id: '3',
            studentName: 'Mike Johnson',
            assignmentTitle: 'Web Development Assignment',
            submittedAt: '2026-05-07T11:20:00',
            status: 'reviewed',
            aiSuspicionScore: 0.18,
          },
        ];

        const mockDeadlines: UpcomingDeadline[] = [
          {
            id: '1',
            title: 'Database Design Project',
            subject: 'Computer Science',
            deadline: '2026-05-15T23:59:59',
            submissionsCount: 12,
            totalStudents: 20,
          },
          {
            id: '2',
            title: 'Algorithm Analysis',
            subject: 'Data Structures',
            deadline: '2026-05-10T23:59:59',
            submissionsCount: 18,
            totalStudents: 25,
          },
        ];

        const mockSectionActivity: SectionActivity[] = [
          {
            sectionName: 'CS-A',
            studentCount: 20,
            activeAssignments: 3,
            pendingSubmissions: 5,
            recentActivity: '12 submissions in last 24 hours',
          },
          {
            sectionName: 'CS-B',
            studentCount: 18,
            activeAssignments: 2,
            pendingSubmissions: 3,
            recentActivity: '8 submissions in last 24 hours',
          },
          {
            sectionName: 'CS-C',
            studentCount: 7,
            activeAssignments: 3,
            pendingSubmissions: 2,
            recentActivity: '5 submissions in last 24 hours',
          },
        ];

        const mockAISuggestions: AISuggestion[] = [
          {
            id: '1',
            type: 'deadline',
            message: 'Algorithm Analysis deadline is in 3 days. Consider sending reminder to CS-B section.',
            priority: 'high',
          },
          {
            id: '2',
            type: 'workload',
            message: 'CS-A section has high submission volume. Consider extending deadline by 2 days.',
            priority: 'medium',
          },
          {
            id: '3',
            type: 'grading',
            message: '3 submissions in CS-A have AI suspicion scores > 15%. Review manually.',
            priority: 'high',
          },
          {
            id: '4',
            type: 'scheduling',
            message: 'No exams scheduled for CS-C section. Consider adding midterm review.',
            priority: 'low',
          },
        ];

        setStats(mockStats);
        setRecentSubmissions(mockSubmissions);
        setUpcomingDeadlines(mockDeadlines);
        setSectionActivity(mockSectionActivity);
        setAiSuggestions(mockAISuggestions);
        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'text-green-600 bg-green-50';
      case 'reviewed': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 text-red-700';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-green-500 bg-green-50 text-green-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const getDeadlineStatus = (deadline: string, submissionsCount: number, totalStudents: number) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const submissionRate = (submissionsCount / totalStudents) * 100;

    if (diffDays < 0) return { status: 'overdue', color: 'text-red-600', text: 'Overdue' };
    if (diffDays <= 1) return { status: 'urgent', color: 'text-orange-600', text: 'Tomorrow' };
    if (diffDays <= 3) return { status: 'soon', color: 'text-yellow-600', text: `${diffDays} Days` };
    return { status: 'normal', color: 'text-gray-600', text: `${diffDays} Days` };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Teacher Dashboard</h1>
        <p className="text-sm text-gray-600">Manage assignments, review submissions, and track student progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
            </div>
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
            <FileText className="w-6 h-6 text-yellow-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Completed Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedReviews}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Upcoming Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingExams}</p>
            </div>
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Student Submissions */}
        <GlassCard className="lg:col-span-2 p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Recent Student Submissions</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Latest submissions from your sections</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                View All
              </motion.button>
            </div>
          </div>
          
          <div className="space-y-2">
            {recentSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 text-sm">{submission.studentName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{submission.assignmentTitle}</p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-3">
                  {submission.aiSuspicionScore !== undefined && (
                    <div className={`flex items-center space-x-1 text-xs ${
                      submission.aiSuspicionScore > 0.15 ? 'text-red-600' :
                      submission.aiSuspicionScore > 0.1 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      <Brain className="w-3 h-3" />
                      <span>{(submission.aiSuspicionScore * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* AI Suggestions Panel */}
        <GlassCard className="p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1">AI Suggestions</h3>
            <div className="flex items-center space-x-2">
              <Brain className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-gray-600">Teaching insights</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {aiSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start space-x-2">
                  <Brain className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{suggestion.message}</p>
                    <span className={`text-xs font-medium ${
                      suggestion.priority === 'high' ? 'text-red-600' :
                      suggestion.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {suggestion.type.toUpperCase()} - {suggestion.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Upcoming Deadlines */}
        <GlassCard className="p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Upcoming Deadlines</h3>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-orange-600" />
              <span className="text-xs text-gray-600">Assignment deadlines</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline) => {
              const deadlineStatus = getDeadlineStatus(deadline.deadline, deadline.submissionsCount, deadline.totalStudents);
              
              return (
                <div key={deadline.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{deadline.title}</p>
                      <p className="text-xs text-gray-600">{deadline.subject}</p>
                    </div>
                    <span className={`text-xs font-medium ${deadlineStatus.color}`}>
                      {deadlineStatus.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Due: {new Date(deadline.deadline).toLocaleDateString()}</span>
                    <span>{deadline.submissionsCount}/{deadline.totalStudents} submitted</span>
                  </div>
                  
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(deadline.submissionsCount / deadline.totalStudents) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Section Activity */}
        <GlassCard className="p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Section Activity</h3>
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-green-600" />
              <span className="text-xs text-gray-600">Student engagement</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {sectionActivity.map((section, index) => (
              <motion.div
                key={section.sectionName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{section.sectionName}</h4>
                  <span className="text-xs text-gray-600">{section.studentCount} students</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{section.activeAssignments}</p>
                    <p className="text-gray-600">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{section.pendingSubmissions}</p>
                    <p className="text-gray-600">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-orange-600">{section.recentActivity.split(' ')[0]}</p>
                    <p className="text-gray-600">24h</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Late Submissions</p>
              <p className="text-2xl font-bold text-red-600">{stats.lateSubmissions}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Average Grade</p>
              <p className="text-2xl font-bold text-green-600">{stats.averageGrade}%</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DashboardHome;
