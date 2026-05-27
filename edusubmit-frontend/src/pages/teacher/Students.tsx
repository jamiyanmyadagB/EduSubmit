import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  MoreVertical,
  Download,
  Eye
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentId: string;
  sectionId: string;
  sectionName: string;
  status: 'ACTIVE' | 'INACTIVE';
  enrolledAt: string;
  lastLogin: string;
  submissionStats: {
    totalAssignments: number;
    submittedAssignments: number;
    averageGrade: number;
    lateSubmissions: number;
    aiSuspicionAverage: number;
  };
  progress: {
    overallProgress: number;
    improvementTrend: 'up' | 'down' | 'stable';
    lastSubmissionDate: string;
  };
}

interface Section {
  id: string;
  name: string;
  studentCount: number;
  teacherId: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'submissions' | 'grades'>('name');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch students and sections
    const fetchData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockStudents: Student[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@lpu.in',
            phone: '+91-9876543210',
            studentId: 'LPU2023001',
            sectionId: '1',
            sectionName: 'CS-A',
            status: 'ACTIVE',
            enrolledAt: '2026-01-15T10:00:00',
            lastLogin: '2026-05-07T14:30:00',
            submissionStats: {
              totalAssignments: 12,
              submittedAssignments: 10,
              averageGrade: 78.5,
              lateSubmissions: 2,
              aiSuspicionAverage: 0.12
            },
            progress: {
              overallProgress: 83,
              improvementTrend: 'up',
              lastSubmissionDate: '2026-05-06T16:30:00'
            }
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@lpu.in',
            phone: '+91-9876543211',
            studentId: 'LPU2023002',
            sectionId: '1',
            sectionName: 'CS-A',
            status: 'ACTIVE',
            enrolledAt: '2026-01-15T10:00:00',
            lastLogin: '2026-05-06T11:20:00',
            submissionStats: {
              totalAssignments: 12,
              submittedAssignments: 11,
              averageGrade: 92.3,
              lateSubmissions: 0,
              aiSuspicionAverage: 0.08
            },
            progress: {
              overallProgress: 92,
              improvementTrend: 'up',
              lastSubmissionDate: '2026-05-07T14:20:00'
            }
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@lpu.in',
            studentId: 'LPU2023003',
            sectionId: '2',
            sectionName: 'CS-B',
            status: 'ACTIVE',
            enrolledAt: '2026-01-15T10:00:00',
            lastLogin: '2026-05-05T16:45:00',
            submissionStats: {
              totalAssignments: 12,
              submittedAssignments: 8,
              averageGrade: 65.7,
              lateSubmissions: 4,
              aiSuspicionAverage: 0.18
            },
            progress: {
              overallProgress: 67,
              improvementTrend: 'down',
              lastSubmissionDate: '2026-05-04T11:30:00'
            }
          },
          {
            id: '4',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@lpu.in',
            studentId: 'LPU2023004',
            sectionId: '2',
            sectionName: 'CS-B',
            status: 'ACTIVE',
            enrolledAt: '2026-01-15T10:00:00',
            lastLogin: '2026-05-06T09:15:00',
            submissionStats: {
              totalAssignments: 12,
              submittedAssignments: 9,
              averageGrade: 74.8,
              lateSubmissions: 3,
              aiSuspicionAverage: 0.15
            },
            progress: {
              overallProgress: 75,
              improvementTrend: 'stable',
              lastSubmissionDate: '2026-05-05T16:45:00'
            }
          },
          {
            id: '5',
            name: 'Tom Brown',
            email: 'tom.brown@lpu.in',
            studentId: 'LPU2023005',
            sectionId: '3',
            sectionName: 'CS-C',
            status: 'ACTIVE',
            enrolledAt: '2026-01-15T10:00:00',
            lastLogin: '2026-05-04T08:30:00',
            submissionStats: {
              totalAssignments: 12,
              submittedAssignments: 6,
              averageGrade: 71.2,
              lateSubmissions: 2,
              aiSuspicionAverage: 0.22
            },
            progress: {
              overallProgress: 50,
              improvementTrend: 'down',
              lastSubmissionDate: '2026-05-03T11:20:00'
            }
          }
        ];

        const mockSections: Section[] = [
          { id: '1', name: 'CS-A', studentCount: 20, teacherId: user?.id || 'teacher1' },
          { id: '2', name: 'CS-B', studentCount: 25, teacherId: user?.id || 'teacher1' },
          { id: '3', name: 'CS-C', studentCount: 7, teacherId: user?.id || 'teacher1' },
          { id: '4', name: 'CS-D', studentCount: 18, teacherId: user?.id || 'teacher1' }
        ];

        setStudents(mockStudents);
        setFilteredStudents(mockStudents);
        setSections(mockSections);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter and sort students
    let filtered = students;

    if (sectionFilter !== 'all') {
      filtered = filtered.filter(student => student.sectionId === sectionFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return b.progress.overallProgress - a.progress.overallProgress;
        case 'submissions':
          return b.submissionStats.submittedAssignments - a.submissionStats.submittedAssignments;
        case 'grades':
          return b.submissionStats.averageGrade - a.submissionStats.averageGrade;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, sectionFilter, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600 bg-green-50';
    if (progress >= 75) return 'text-blue-600 bg-blue-50';
    if (progress >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAISuspicionColor = (score: number) => {
    if (score > 0.2) return 'text-red-600 bg-red-50';
    if (score > 0.15) return 'text-orange-600 bg-orange-50';
    if (score > 0.1) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const handleDownloadReport = (student: Student) => {
    // In real app, this would generate and download student report
    console.log('Downloading report for:', student.name);
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
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Monitor student progress and submission patterns</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Section Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Sections</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="submissions">Sort by Submissions</option>
              <option value="grades">Sort by Grades</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{student.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{student.studentId}</p>
                    <p className="text-sm text-gray-600">{student.sectionName}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                    
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{student.email}</span>
                  </div>
                  
                  {student.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.phone}</span>
                    </div>
                  )}
                </div>

                {/* Progress Overview */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <div className="flex items-center space-x-2">
                      <div className={`text-lg font-bold ${getProgressColor(student.progress.overallProgress)}`}>
                        {student.progress.overallProgress}%
                      </div>
                      {student.progress.improvementTrend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                      {student.progress.improvementTrend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      {student.progress.improvementTrend === 'stable' && (
                        <div className="w-4 h-4 bg-gray-400 rounded-full" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Activity</span>
                    <span className="text-sm text-gray-900">
                      {new Date(student.progress.lastSubmissionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Submission Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Submissions</p>
                    <p className="text-lg font-bold text-gray-900">
                      {student.submissionStats.submittedAssignments}/{student.submissionStats.totalAssignments}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Avg Grade</p>
                    <p className={`text-lg font-bold ${getProgressColor(student.submissionStats.averageGrade)}`}>
                      {student.submissionStats.averageGrade.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="text-lg font-bold text-red-600">
                      {student.submissionStats.lateSubmissions}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">AI Suspicion</p>
                    <div className={`text-lg font-bold ${getAISuspicionColor(student.submissionStats.aiSuspicionAverage)}`}>
                      {(student.submissionStats.aiSuspicionAverage * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Enrolled</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(student.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => handleViewStudent(student)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View Details</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleDownloadReport(student)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download Report</span>
                  </motion.button>
                </div>
              </div>
          </GlassCard>
        </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'No students assigned to your sections'}
          </p>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
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
                  <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.name} - {selectedStudent.studentId}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowStudentDetails(false);
                    setSelectedStudent(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="font-medium text-gray-900">{selectedStudent.studentId}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedStudent.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedStudent.phone || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Section</p>
                      <p className="font-medium text-gray-900">{selectedStudent.sectionName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStudent.status)}`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Enrolled Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedStudent.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Last Login</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedStudent.lastLogin).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Performance</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Overall Progress</p>
                      <div className="flex items-center space-x-2">
                        <div className={`text-2xl font-bold ${getProgressColor(selectedStudent.progress.overallProgress)}`}>
                          {selectedStudent.progress.overallProgress}%
                        </div>
                        {selectedStudent.progress.improvementTrend === 'up' && (
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        )}
                        {selectedStudent.progress.improvementTrend === 'down' && (
                          <TrendingDown className="w-6 h-6 text-red-600" />
                        )}
                        {selectedStudent.progress.improvementTrend === 'stable' && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Last Submission</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedStudent.progress.lastSubmissionDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submission Statistics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Statistics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Assignments</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedStudent.submissionStats.totalAssignments}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedStudent.submissionStats.submittedAssignments}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Average Grade</p>
                      <p className={`text-2xl font-bold ${getProgressColor(selectedStudent.submissionStats.averageGrade)}`}>
                        {selectedStudent.submissionStats.averageGrade.toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Late Submissions</p>
                      <p className="text-2xl font-bold text-red-600">
                        {selectedStudent.submissionStats.lateSubmissions}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">AI Suspicion Average</p>
                      <p className={`text-2xl font-bold ${getAISuspicionColor(selectedStudent.submissionStats.aiSuspicionAverage)}`}>
                        {(selectedStudent.submissionStats.aiSuspicionAverage * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <motion.button
                onClick={() => handleDownloadReport(selectedStudent)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Download Full Report</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Students;
