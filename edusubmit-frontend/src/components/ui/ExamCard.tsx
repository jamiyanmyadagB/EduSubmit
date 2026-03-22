import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, Eye } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  deadline: string;
  status: 'pending' | 'submitted';
  description?: string;
}

interface ExamCardProps {
  exam: Exam;
  onViewDetails: (exam: Exam) => void;
  isLoading?: boolean;
}

/**
 * Exam card component for upcoming submissions
 * Shows exam title, deadline, status badge, and view details button
 */
const ExamCard: React.FC<ExamCardProps> = ({ exam, onViewDetails, isLoading = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'submitted':
        return 'Submitted';
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {exam.title}
          </h3>
          {exam.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {exam.description}
            </p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(exam.status)}`}>
          {getStatusText(exam.status)}
        </div>
      </div>

      {/* Deadline */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
        <span className="font-medium">{formatDate(exam.deadline)}</span>
      </div>

      {/* Time remaining indicator */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Clock className="w-4 h-4 mr-2 text-gray-400" />
        <span className="font-medium">
          {exam.status === 'pending' ? 'Submission pending' : 'Already submitted'}
        </span>
      </div>

      {/* Action button */}
      <motion.button
        onClick={() => onViewDetails(exam)}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Eye className="w-4 h-4" />
        <span className="font-medium">
          {isLoading ? 'Loading...' : 'View Details'}
        </span>
      </motion.button>
    </motion.div>
  );
};

export default ExamCard;
