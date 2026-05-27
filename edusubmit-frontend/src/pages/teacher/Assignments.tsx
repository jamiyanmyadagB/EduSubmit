import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  Eye,
  Download,
  Archive,
  MoreVertical
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  instructions: string;
  guidelines: string;
  deadline: string;
  marks?: number;
  weightage?: number;
  sectionId: string;
  sectionName: string;
  status: 'draft' | 'published' | 'archived';
  submissionCount: number;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
  attachedFiles?: Array<{
    id: string;
    name: string;
    url: string;
    size: string;
    type: string;
  }>;
}

interface Section {
  id: string;
  name: string;
  studentCount: number;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch assignments and sections
    const fetchData = async () => {
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
            marks: 100,
            weightage: 20,
            sectionId: '1',
            sectionName: 'CS-A',
            status: 'published',
            submissionCount: 12,
            totalStudents: 20,
            createdAt: '2026-05-01T10:00:00',
            updatedAt: '2026-05-01T10:00:00',
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
            marks: 80,
            weightage: 15,
            sectionId: '2',
            sectionName: 'CS-B',
            status: 'published',
            submissionCount: 18,
            totalStudents: 25,
            createdAt: '2026-05-02T14:30:00',
            updatedAt: '2026-05-02T14:30:00'
          },
          {
            id: '3',
            title: 'Web Development Assignment',
            subject: 'Software Engineering',
            description: 'Build a responsive web application using modern frameworks.',
            instructions: 'Create frontend, backend, and deploy to cloud platform.',
            guidelines: 'Use responsive design, follow accessibility standards, include tests.',
            deadline: '2026-05-20T23:59:59',
            marks: 120,
            weightage: 25,
            sectionId: '3',
            sectionName: 'CS-C',
            status: 'draft',
            submissionCount: 0,
            totalStudents: 7,
            createdAt: '2026-05-05T16:45:00',
            updatedAt: '2026-05-05T16:45:00'
          }
        ];

        const mockSections: Section[] = [
          { id: '1', name: 'CS-A', studentCount: 20 },
          { id: '2', name: 'CS-B', studentCount: 25 },
          { id: '3', name: 'CS-C', studentCount: 7 },
          { id: '4', name: 'CS-D', studentCount: 18 }
        ];

        setAssignments(mockAssignments);
        setFilteredAssignments(mockAssignments);
        setSections(mockSections);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter assignments based on search and filters
    let filtered = assignments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }

    if (sectionFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.sectionId === sectionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, statusFilter, sectionFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50 border-green-200';
      case 'draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', color: 'text-red-600', text: 'Overdue' };
    if (diffDays <= 1) return { status: 'urgent', color: 'text-orange-600', text: 'Tomorrow' };
    if (diffDays <= 3) return { status: 'soon', color: 'text-yellow-600', text: `${diffDays} Days` };
    return { status: 'normal', color: 'text-gray-600', text: `${diffDays} Days` };
  };

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setShowCreateModal(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowEditModal(true);
  };

  const handleArchiveAssignment = (assignmentId: string) => {
    // In real app, this would call API
    setAssignments(prev => prev.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, status: 'archived' }
        : assignment
    ));
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handleViewSubmissions = (assignmentId: string) => {
    // Navigate to submissions page for this assignment
    window.location.href = `/teacher/submissions?assignment=${assignmentId}`;
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
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Create and manage assignments for your sections</p>
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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

          {/* Create Button */}
          <motion.button
            onClick={handleCreateAssignment}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </motion.button>
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
              <GlassCard>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">{assignment.subject}</p>
                      <p className="text-xs text-gray-500">
                        Section: {assignment.sectionName} • {assignment.totalStudents} students
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      
                      <div className="relative">
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {assignment.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Due: {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${deadlineStatus.color}`}>
                        {deadlineStatus.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {assignment.marks} marks ({assignment.weightage}% weight)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {assignment.submissionCount}/{assignment.totalStudents} submitted
                      </span>
                    </div>
                  </div>

                  {/* Attached Files */}
                  {assignment.attachedFiles && assignment.attachedFiles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Attached Files</p>
                      <div className="space-y-2">
                        {assignment.attachedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
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
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.button
                        onClick={() => handleViewSubmissions(assignment.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View Submissions</span>
                      </motion.button>
                      
                      {assignment.status === 'published' && (
                        <motion.button
                          onClick={() => handleArchiveAssignment(assignment.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          <span className="text-sm">Archive</span>
                        </motion.button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {assignment.status === 'draft' && (
                        <motion.button
                          onClick={() => handleEditAssignment(assignment)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </motion.button>
                      )}
                      
                      {assignment.status === 'published' && (
                        <motion.button
                          onClick={() => handleEditAssignment(assignment)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="text-sm">Update</span>
                        </motion.button>
                      )}
                    </div>
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
            {searchTerm ? 'Try adjusting your search or filters' : 'Create your first assignment to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Assignment Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {showCreateModal ? 'Create Assignment' : 'Edit Assignment'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="text-sm text-gray-600">
                Assignment creation and editing form would go here...
                <br /><br />
                This would include:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Title and subject selection</li>
                  <li>Description and instructions</li>
                  <li>Guidelines and requirements</li>
                  <li>Deadline and marks configuration</li>
                  <li>Section assignment</li>
                  <li>File attachments</li>
                  <li>Save as draft or publish</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
