import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import AssignmentCard3D from '../components/3D/AssignmentCard3D';
import AnimatedBackground from '../components/3D/AnimatedBackground';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface Submission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedDate: string;
  status: 'pending' | 'graded' | 'reviewed';
  grade?: number;
  aiScore?: number;
  needsReview: boolean;
}

const TeacherDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching submissions
    setTimeout(() => {
      setSubmissions([
        {
          id: '1',
          studentName: 'John Doe',
          assignmentTitle: 'Machine Learning Project',
          submittedDate: '2024-03-20',
          status: 'pending',
          aiScore: 85,
          needsReview: true
        },
        {
          id: '2',
          studentName: 'Jane Smith',
          assignmentTitle: 'Web Development Assignment',
          submittedDate: '2024-03-19',
          status: 'graded',
          grade: 92,
          aiScore: 88,
          needsReview: false
        },
        {
          id: '3',
          studentName: 'Mike Johnson',
          assignmentTitle: 'Database Design',
          submittedDate: '2024-03-18',
          status: 'reviewed',
          grade: 78,
          aiScore: 82,
          needsReview: false
        },
        {
          id: '4',
          studentName: 'Sarah Williams',
          assignmentTitle: 'Machine Learning Project',
          submittedDate: '2024-03-20',
          status: 'pending',
          aiScore: 91,
          needsReview: true
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalSubmissions: submissions.length,
    pendingGrading: submissions.filter(s => s.status === 'pending').length,
    averageGrade: submissions.filter(s => s.grade).reduce((acc, s) => acc + (s.grade || 0), 0) / submissions.filter(s => s.grade).length || 0,
    needsReview: submissions.filter(s => s.needsReview).length
  };

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

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

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Teacher Dashboard</h1>
            <p className="text-gray-300">Manage assignments and review student submissions</p>
          </div>
          
          <div className="flex gap-4">
            <AnimatedButton
              onClick={() => navigate('/create-assignment')}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Assignment
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
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
                  <p className="text-gray-300 text-sm">Total Submissions</p>
                  <p className="text-3xl font-bold text-white">{stats.totalSubmissions}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Pending Grading</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingGrading}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Average Grade</p>
                  <p className="text-3xl font-bold text-white">{stats.averageGrade.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">AI Review Needed</p>
                  <p className="text-3xl font-bold text-white">{stats.needsReview}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-purple-400" />
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search submissions..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'graded'].map((filterOption) => (
              <AnimatedButton
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                variant={filter === filterOption ? 'primary' : 'secondary'}
                size="sm"
                className="capitalize"
              >
                {filterOption}
              </AnimatedButton>
            ))}
          </div>
        </motion.div>

        {/* Submissions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Submissions</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <GlassCard className="h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {submission.assignmentTitle}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          by {submission.studentName}
                        </p>
                      </div>
                      
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.status === 'graded' ? 'bg-green-500/20 text-green-300' : 
                        submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {submission.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Submitted</span>
                        <span className="text-white text-sm">{submission.submittedDate}</span>
                      </div>

                      {submission.aiScore && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">AI Score</span>
                          <span className="text-purple-400 font-medium">{submission.aiScore}%</span>
                        </div>
                      )}

                      {submission.grade && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Final Grade</span>
                          <span className="text-green-400 font-medium">{submission.grade}%</span>
                        </div>
                      )}

                      {submission.needsReview && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2"
                        >
                          <p className="text-yellow-300 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            AI suggests manual review
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </AnimatedButton>
                      
                      <AnimatedButton
                        variant="primary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Grade
                      </AnimatedButton>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Suggestions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              AI Suggestions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  type: 'warning',
                  title: 'Unusual Submission Pattern',
                  description: 'John Doe submitted 3 assignments within 10 minutes',
                  action: 'Review submissions'
                },
                {
                  type: 'info',
                  title: 'High-Performing Students',
                  description: '5 students scored above 95% this week',
                  action: 'View analytics'
                },
                {
                  type: 'success',
                  title: 'Assignment Completion',
                  description: '92% of students submitted the latest assignment',
                  action: 'View details'
                },
                {
                  type: 'warning',
                  title: 'Late Submissions',
                  description: '3 students submitted assignments after deadline',
                  action: 'Review cases'
                }
              ].map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    suggestion.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    suggestion.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <h3 className={`font-medium mb-1 ${
                    suggestion.type === 'warning' ? 'text-yellow-300' :
                    suggestion.type === 'success' ? 'text-green-300' : 'text-blue-300'
                  }`}>
                    {suggestion.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                  <AnimatedButton variant="secondary" size="sm">
                    {suggestion.action}
                  </AnimatedButton>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
