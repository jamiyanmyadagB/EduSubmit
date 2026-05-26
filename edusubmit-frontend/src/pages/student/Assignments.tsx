import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Filter,
  Search,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  instructions: string;
  guidelines: string;
  deadline: string;
  teacherId: string;
  teacherName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'late';
  submissionStatus?: 'not_submitted' | 'submitted' | 'graded';
  attachedFiles?: Array<{
    id: string;
    name: string;
    url: string;
    size: string;
    type: string;
  }>;
  submission?: {
    id: string;
    submittedAt: string;
    files: Array<{
      id: string;
      name: string;
      url: string;
      size: string;
    }>;
    feedback?: string;
    grade?: number;
  };
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API call to fetch assignments
    const fetchAssignments = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockAssignments: Assignment[] = [
          {
            id: '1',
            title: 'Database Design Project',
            subject: 'Computer Science',
            description: 'Design and implement a comprehensive database system for an e-commerce platform.',
            instructions: 'Create ER diagram, implement tables, write SQL queries, and prepare documentation.',
            guidelines: 'Follow normalization rules, include proper indexing, and ensure data integrity.',
            deadline: '2026-05-15T23:59:59',
            teacherId: 'teacher1',
            teacherName: 'Dr. Smith',
            status: 'pending',
            submissionStatus: 'not_submitted',
            attachedFiles: [
              {
                id: '1',
                name: 'project_requirements.pdf',
                url: '/files/requirements.pdf',
                size: '2.5 MB',
                type: 'pdf'
              }
            ]
          },
          {
            id: '2',
            title: 'Algorithm Analysis',
            subject: 'Data Structures',
            description: 'Analyze time complexity of various sorting algorithms.',
            instructions: 'Implement algorithms, measure performance, create comparison charts.',
            guidelines: 'Include Big-O notation, empirical analysis, and visual representations.',
            deadline: '2026-05-10T23:59:59',
            teacherId: 'teacher2',
            teacherName: 'Prof. Johnson',
            status: 'in-progress',
            submissionStatus: 'submitted',
            submission: {
              id: 'sub1',
              submittedAt: '2026-05-08T14:30:00',
              files: [
                {
                  id: 'file1',
                  name: 'algorithm_analysis.pdf',
                  url: '/submissions/analysis.pdf',
                  size: '1.8 MB'
                }
              ]
            }
          },
          {
            id: '3',
            title: 'Web Development Assignment',
            subject: 'Software Engineering',
            description: 'Build a responsive web application using modern frameworks.',
            instructions: 'Create frontend, backend, and deploy to cloud platform.',
            guidelines: 'Use responsive design, follow accessibility standards, include tests.',
            deadline: '2026-05-05T23:59:59',
            teacherId: 'teacher3',
            teacherName: 'Dr. Brown',
            status: 'completed',
            submissionStatus: 'graded',
            submission: {
              id: 'sub2',
              submittedAt: '2026-05-04T16:45:00',
              files: [
                {
                  id: 'file2',
                  name: 'webapp.zip',
                  url: '/submissions/webapp.zip',
                  size: '5.2 MB'
                }
              ],
              feedback: 'Excellent work! Great use of modern frameworks and responsive design.',
              grade: 95
            }
          }
        ];

        setAssignments(mockAssignments);
        setFilteredAssignments(mockAssignments);
        setLoading(false);
      }, 1000);
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    // Filter assignments based on search and status
    let filtered = assignments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'late': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'text-red-600' };
    if (diffDays <= 1) return { status: 'urgent', text: 'Due Tomorrow', color: 'text-orange-600' };
    if (diffDays <= 3) return { status: 'soon', text: `${diffDays} Days Left`, color: 'text-yellow-600' };
    return { status: 'normal', text: `${diffDays} Days Left`, color: 'text-gray-600' };
  };

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedAssignment(null);
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">View and manage your assignments</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment, index) => {
          const deadlineStatus = getDeadlineStatus(assignment.deadline);
          
          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">{assignment.subject}</p>
                      <p className="text-xs text-gray-500">by {assignment.teacherName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {assignment.description}
                  </p>

                  {/* Deadline */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${deadlineStatus.color}`}>
                      {deadlineStatus.text}
                    </span>
                  </div>

                  {/* Submission Status */}
                  {assignment.submissionStatus && (
                    <div className={`p-2 rounded-lg ${getStatusColor(assignment.status)}`}>
                      <div className="flex items-center space-x-2">
                        {assignment.submissionStatus === 'graded' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {assignment.submissionStatus === 'not_submitted' && 'Not Submitted'}
                          {assignment.submissionStatus === 'submitted' && 'Submitted'}
                          {assignment.submissionStatus === 'graded' && `Grade: ${assignment.submission?.grade}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {assignment.attachedFiles && assignment.attachedFiles.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {assignment.attachedFiles.length} file(s) attached
                        </span>
                      )}
                      {assignment.submission && (
                        <span className="text-xs text-gray-500">
                          Submitted: {new Date(assignment.submission.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <motion.button
                      onClick={() => handleViewDetails(assignment)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'No assignments available at the moment'}
          </p>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {showDetailModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                  <p className="text-gray-600">{selectedAssignment.subject}</p>
                  <p className="text-sm text-gray-500">by {selectedAssignment.teacherName}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Assignment Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedAssignment.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Guidelines</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.guidelines}</p>
                </div>

                {/* Deadline */}
                <div className={`p-4 rounded-lg ${getDeadlineStatus(selectedAssignment.deadline).status === 'overdue' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-gray-900">Deadline</p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedAssignment.deadline).toLocaleString()}
                      </p>
                      <p className={`text-sm font-medium ${getDeadlineStatus(selectedAssignment.deadline).color}`}>
                        {getDeadlineStatus(selectedAssignment.deadline).text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attached Files */}
                {selectedAssignment.attachedFiles && selectedAssignment.attachedFiles.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Attached Files</h3>
                    <div className="space-y-2">
                      {selectedAssignment.attachedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-600">{file.size}</p>
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
                )}

                {/* Submission Info */}
                {selectedAssignment.submission && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Your Submission</h3>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Submitted:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedAssignment.submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {selectedAssignment.submission.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">{file.size}</span>
                        </div>
                      ))}

                      {selectedAssignment.submission.feedback && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="font-semibold text-gray-900 mb-1">Feedback:</p>
                          <p className="text-gray-700">{selectedAssignment.submission.feedback}</p>
                        </div>
                      )}

                      {selectedAssignment.submission.grade && (
                        <div className="mt-2">
                          <span className="text-lg font-bold text-green-600">
                            Grade: {selectedAssignment.submission.grade}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
