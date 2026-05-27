import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  FileText,
  Download,
  Eye,
  Clock,
  Calendar,
  User,
  Filter,
  Search,
  Brain,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Star,
  Edit3
} from 'lucide-react';

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  deadline: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'completed' | 'late' | 'ai-suspected' | 'resubmission_requested';
  files: Array<{
    id: string;
    name: string;
    url: string;
    size: string;
    type: string;
  }>;
  feedback?: string;
  grade?: number;
  aiSuspicionScore?: number;
  resubmissionRequested?: boolean;
  resubmissionDeadline?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  totalSubmissions: number;
  reviewedSubmissions: number;
}

const Submissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'grade' | 'ai-suspicion'>('date');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch submissions and assignments
    const fetchData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockSubmissions: Submission[] = [
          {
            id: '1',
            assignmentId: '1',
            assignmentTitle: 'Database Design Project',
            subject: 'Computer Science',
            deadline: '2026-05-15T23:59:59',
            studentName: 'John Doe',
            studentEmail: 'john.doe@lpu.in',
            submittedAt: '2026-05-14T16:30:00',
            status: 'pending',
            files: [
              {
                id: '1',
                name: 'database_design.pdf',
                url: '/files/submissions/database_design.pdf',
                size: '2.5 MB',
                type: 'pdf'
              }
            ],
            aiSuspicionScore: 0.12
          },
          {
            id: '2',
            assignmentId: '1',
            assignmentTitle: 'Database Design Project',
            subject: 'Computer Science',
            deadline: '2026-05-15T23:59:59',
            studentName: 'Jane Smith',
            studentEmail: 'jane.smith@lpu.in',
            submittedAt: '2026-05-13T14:20:00',
            status: 'reviewed',
            files: [
              {
                id: '2',
                name: 'database_implementation.zip',
                url: '/files/submissions/database_implementation.zip',
                size: '5.2 MB',
                type: 'zip'
              }
            ],
            feedback: 'Good implementation of database normalization. Consider adding more documentation.',
            aiSuspicionScore: 0.08
          },
          {
            id: '3',
            assignmentId: '2',
            assignmentTitle: 'Algorithm Analysis',
            subject: 'Data Structures',
            deadline: '2026-05-10T23:59:59',
            studentName: 'Mike Johnson',
            studentEmail: 'mike.johnson@lpu.in',
            submittedAt: '2026-05-11T01:15:00',
            status: 'late',
            files: [
              {
                id: '3',
                name: 'algorithm_analysis.docx',
                url: '/files/submissions/algorithm_analysis.docx',
                size: '1.8 MB',
                type: 'docx'
              }
            ],
            aiSuspicionScore: 0.35
          },
          {
            id: '4',
            assignmentId: '2',
            assignmentTitle: 'Algorithm Analysis',
            subject: 'Data Structures',
            deadline: '2026-05-10T23:59:59',
            studentName: 'Sarah Wilson',
            studentEmail: 'sarah.wilson@lpu.in',
            submittedAt: '2026-05-08T16:45:00',
            status: 'completed',
            files: [
              {
                id: '4',
                name: 'algorithms_comprehensive.pdf',
                url: '/files/submissions/algorithms_comprehensive.pdf',
                size: '3.1 MB',
                type: 'pdf'
              }
            ],
            feedback: 'Excellent analysis of sorting algorithms with complexity calculations.',
            grade: 92,
            aiSuspicionScore: 0.05
          },
          {
            id: '5',
            assignmentId: '3',
            assignmentTitle: 'Web Development Assignment',
            subject: 'Software Engineering',
            deadline: '2026-05-20T23:59:59',
            studentName: 'Tom Brown',
            studentEmail: 'tom.brown@lpu.in',
            submittedAt: '2026-05-18T11:30:00',
            status: 'ai-suspected',
            files: [
              {
                id: '5',
                name: 'webapp.zip',
                url: '/files/submissions/webapp.zip',
                size: '8.7 MB',
                type: 'zip'
              }
            ],
            aiSuspicionScore: 0.68
          }
        ];

        const mockAssignments: Assignment[] = [
          {
            id: '1',
            title: 'Database Design Project',
            subject: 'Computer Science',
            deadline: '2026-05-15T23:59:59',
            totalSubmissions: 20,
            reviewedSubmissions: 15
          },
          {
            id: '2',
            title: 'Algorithm Analysis',
            subject: 'Data Structures',
            deadline: '2026-05-10T23:59:59',
            totalSubmissions: 25,
            reviewedSubmissions: 18
          },
          {
            id: '3',
            title: 'Web Development Assignment',
            subject: 'Software Engineering',
            deadline: '2026-05-20T23:59:59',
            totalSubmissions: 7,
            reviewedSubmissions: 3
          }
        ];

        setSubmissions(mockSubmissions);
        setAssignments(mockAssignments);
        setFilteredSubmissions(mockSubmissions);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter and sort submissions
    let filtered = submissions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    if (assignmentFilter !== 'all') {
      filtered = filtered.filter(submission => submission.assignmentId === assignmentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort submissions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'name':
          return a.studentName.localeCompare(b.studentName);
        case 'grade':
          return (b.grade || 0) - (a.grade || 0);
        case 'ai-suspicion':
          return (b.aiSuspicionScore || 0) - (a.aiSuspicionScore || 0);
        default:
          return 0;
      }
    });

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, assignmentFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'reviewed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'late': return 'text-red-600 bg-red-50 border-red-200';
      case 'ai-suspected': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'resubmission_requested': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAISuspicionColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score > 0.5) return 'text-red-600';
    if (score > 0.2) return 'text-orange-600';
    if (score > 0.1) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
  };

  const handleAddFeedback = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedbackText(submission.feedback || '');
    setGrade(submission.grade?.toString() || '');
    setShowFeedbackModal(true);
  };

  const handleSaveFeedback = () => {
    if (!selectedSubmission) return;

    // In real app, this would call API to save feedback and grade
    console.log('Saving feedback:', {
      submissionId: selectedSubmission.id,
      feedback: feedbackText,
      grade: parseInt(grade)
    });

    // Update local state
    setSubmissions(prev => prev.map(submission =>
      submission.id === selectedSubmission.id
        ? { ...submission, feedback: feedbackText, grade: parseInt(grade), status: 'completed' }
        : submission
    ));

    setShowFeedbackModal(false);
    setSelectedSubmission(null);
    setFeedbackText('');
    setGrade('');
  };

  const handleRequestResubmission = (submission: Submission) => {
    // In real app, this would call API to request resubmission
    console.log('Requesting resubmission for:', submission.id);

    // Update local state
    setSubmissions(prev => prev.map(s =>
      s.id === submission.id
        ? { ...s, status: 'resubmission_requested', resubmissionRequested: true }
        : s
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-600">Review and grade student submissions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="completed">Completed</option>
              <option value="late">Late</option>
              <option value="ai-suspected">AI Suspected</option>
              <option value="resubmission_requested">Resubmission Requested</option>
            </select>
          </div>

          {/* Assignment Filter */}
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Assignments</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="grade">Sort by Grade</option>
              <option value="ai-suspicion">Sort by AI Suspicion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubmissions.map((submission, index) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{submission.studentName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{submission.studentEmail}</p>
                    <p className="text-sm text-gray-600">{submission.subject}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {submission.aiSuspicionScore !== undefined && (
                      <div className={`flex items-center space-x-1 ${getAISuspicionColor(submission.aiSuspicionScore)}`}>
                        <Brain className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {(submission.aiSuspicionScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    
                    {submission.grade !== undefined && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">{submission.grade}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-1">{submission.assignmentTitle}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(submission.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Submitted Files</p>
                  <div className="space-y-2">
                    {submission.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={() => handleDownloadFile(file.url, file.name)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {submission.feedback && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Teacher Feedback</p>
                    <p className="text-sm text-gray-700">{submission.feedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={() => handleViewSubmission(submission)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Review</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleAddFeedback(submission)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Add Feedback</span>
                    </motion.button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {submission.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {submission.status === 'ai-suspected' && (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    )}
                    {submission.resubmissionRequested && (
                      <div className="text-orange-600 text-sm font-medium">Resubmission Requested</div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubmissions.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'No submissions available for review'}
          </p>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Submission Review</h2>
                  <p className="text-sm text-gray-600">
                    {selectedSubmission.studentName} - {selectedSubmission.assignmentTitle}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedSubmission(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Submission Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Assignment</p>
                    <p className="font-medium text-gray-900">{selectedSubmission.assignmentTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-medium text-gray-900">{selectedSubmission.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedSubmission.deadline).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Submitted Files</p>
                  <div className="space-y-2">
                    {selectedSubmission.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={() => handleDownloadFile(file.url, file.name)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedSubmission.aiSuspicionScore !== undefined && (
                  <div className={`p-4 rounded-lg ${
                    selectedSubmission.aiSuspicionScore > 0.3 ? 'bg-red-50 border-red-200' :
                    selectedSubmission.aiSuspicionScore > 0.1 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5" />
                      <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                    </div>
                    <p className="text-sm text-gray-700">
                      AI suspicion score: <span className={`font-bold ${getAISuspicionColor(selectedSubmission.aiSuspicionScore)}`}>
                        {(selectedSubmission.aiSuspicionScore * 100).toFixed(0)}%
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedSubmission.aiSuspicionScore > 0.3 ? 'High probability of AI-generated content' :
                       selectedSubmission.aiSuspicionScore > 0.1 ? 'Moderate AI content detected' :
                       'Low AI content detected'}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedSubmission(null);
                    handleRequestResubmission(selectedSubmission);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Request Resubmission</span>
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setShowReviewModal(false);
                    handleAddFeedback(selectedSubmission);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Add Feedback</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Feedback & Grade</h2>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedSubmission(null);
                    setFeedbackText('');
                    setGrade('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Student: {selectedSubmission.studentName}
                  </label>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Assignment: {selectedSubmission.assignmentTitle}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Feedback</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide detailed feedback on the student's work..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Grade (0-100)</label>
                  <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter grade..."
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> This will finalize the grade and publish feedback to the student. 
                    The AI analysis score ({(selectedSubmission.aiSuspicionScore || 0) * 100}%) should be considered 
                    but you make the final grading decision.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedSubmission(null);
                    setFeedbackText('');
                    setGrade('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleSaveFeedback}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save & Publish</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
