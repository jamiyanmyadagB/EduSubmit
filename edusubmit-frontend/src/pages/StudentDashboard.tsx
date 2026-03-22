import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import GlassCard from '../components/ui/GlassCard';
import ExamCard from '../components/ui/ExamCard';
import ExamDetailPanel from '../components/ui/ExamDetailPanel';
import ProfileDropdown from '../components/ui/ProfileDropdown';
import LoadingSkeleton, { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { useApi } from '../hooks/useApi';
import { 
  BookOpen, 
  Clock, 
  Calendar,
  FileText,
  Award,
  Bell,
  RefreshCw
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'submitted';
  requirements?: string;
  teacherFiles?: Array<{
    id: string;
    name: string;
    url: string;
    size: string;
  }>;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: string;
  avatar?: string;
}

const StudentDashboard = () => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // API hooks
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useApi<StudentProfile>('/api/student/profile');
  const { data: exams, isLoading: examsLoading, error: examsError, refetch: refetchExams } = useApi<Exam[]>('/api/exams/upcoming');

  const isLoading = profileLoading || examsLoading;
  const error = profileError || examsError;

  const handleViewDetails = (exam: Exam) => {
    setSelectedExam(exam);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedExam(null);
  };

  const handleSubmitAssignment = async (examId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', examId);
    formData.append('studentId', user?.id || '');
    
    // For now, simulate submission
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API call
        console.log('Submitting assignment:', { examId, fileName: file.name });
        resolve();
      }, 2000);
    });
  };

  const handleAskAI = async (examId: string, question: string): Promise<string> => {
    // For now, simulate AI response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockResponse = `Based on your question about "${question}", here's a helpful response:\n\n1. Start by understanding the assignment requirements\n2. Break down the task into smaller steps\n3. Create an outline before writing\n4. Review your work before submission\n\nThis approach will help you create a well-structured and comprehensive assignment submission.`;
        resolve(mockResponse);
      }, 1500);
    });
  };

  const stats = {
    totalExams: exams?.length || 0,
    pending: exams?.filter(e => e.status === 'pending').length || 0,
    submitted: exams?.filter(e => e.status === 'submitted').length || 0,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="ml-4 text-sm text-gray-600 hidden sm:block">
                Here's your academic progress overview
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
              
              {/* Profile Dropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </GlassCard>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">Failed to load data. Please try again.</p>
            <motion.button
              onClick={() => {
                refetchProfile();
                refetchExams();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </motion.button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && exams && exams.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming exams</h3>
            <p className="text-gray-600">You don't have any upcoming exams at the moment.</p>
          </div>
        )}

        {/* Exam Cards */}
        {!isLoading && !error && exams && exams.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Exams</h2>
              <motion.button
                onClick={refetchExams}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ExamCard
                    exam={exam}
                    onViewDetails={handleViewDetails}
                    isLoading={isLoading}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exam Detail Panel */}
      <ExamDetailPanel
        exam={selectedExam}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetailPanel}
        onSubmitAssignment={handleSubmitAssignment}
        onAskAI={handleAskAI}
      />
    </div>
  );
};

export default StudentDashboard;
