import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Upload,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  deadline: string;
  submittedAt: string;
  status: 'pending' | 'submitted' | 'late' | 'graded' | 'resubmitted';
  files: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
  }>;
  feedback?: string;
  grade?: number;
  aiSuspicionScore?: number;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  instructions: string;
  guidelines: string;
  attachedFiles?: Array<{
    id: string;
    name: string;
    url: string;
    size: string;
  }>;
}

const Submissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);

  const allowedFileTypes = ['pdf', 'docx', 'zip', 'pptx', 'jpg', 'jpeg', 'png'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    // Simulate API call to fetch submissions
    const fetchSubmissions = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockSubmissions: Submission[] = [
          {
            id: '1',
            assignmentId: '1',
            assignmentTitle: 'Database Design Project',
            subject: 'Computer Science',
            deadline: '2026-05-15T23:59:59',
            submittedAt: '2026-05-14T16:30:00',
            status: 'submitted',
            files: [
              {
                id: '1',
                name: 'database_design.pdf',
                size: '2.5 MB',
                type: 'pdf',
                url: '/files/submissions/database_design.pdf'
              }
            ]
          },
          {
            id: '2',
            assignmentId: '2',
            assignmentTitle: 'Algorithm Analysis',
            subject: 'Data Structures',
            deadline: '2026-05-10T23:59:59',
            submittedAt: '2026-05-11T01:15:00',
            status: 'late',
            files: [
              {
                id: '2',
                name: 'algorithm_analysis.docx',
                size: '1.8 MB',
                type: 'docx',
                url: '/files/submissions/algorithm_analysis.docx'
              }
            ],
            aiSuspicionScore: 0.15
          },
          {
            id: '3',
            assignmentId: '3',
            assignmentTitle: 'Web Development Assignment',
            subject: 'Software Engineering',
            deadline: '2026-05-05T23:59:59',
            submittedAt: '2026-05-04T16:45:00',
            status: 'graded',
            files: [
              {
                id: '3',
                name: 'webapp.zip',
                size: '5.2 MB',
                type: 'zip',
                url: '/files/submissions/webapp.zip'
              }
            ],
            feedback: 'Excellent work! Great use of modern frameworks and responsive design. Consider adding more unit tests next time.',
            grade: 95,
            aiSuspicionScore: 0.05
          }
        ];

        setSubmissions(mockSubmissions);
        setLoading(false);
      }, 1000);
    };

    fetchSubmissions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'text-green-600 bg-green-50 border-green-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'late': return 'text-red-600 bg-red-50 border-red-200';
      case 'resubmitted': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const isOverdue = now > deadlineDate;
    
    return {
      isOverdue,
      text: isOverdue ? 'Deadline Exceeded' : deadlineDate.toLocaleString(),
      color: isOverdue ? 'text-red-600' : 'text-gray-600'
    };
  };

  const validateFile = (file: File): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
      setError(`File type .${fileExtension} is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`);
      return false;
    }
    
    if (file.size > maxFileSize) {
      setError(`File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => validateFile(file));
    
    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles]);
      setError('');
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    if (!selectedAssignment) {
      setError('No assignment selected');
      return;
    }

    const deadlineStatus = getDeadlineStatus(selectedAssignment.deadline);
    if (deadlineStatus.isOverdue) {
      setError('Deadline exceeded. Submission requires teacher approval.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload with progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      setTimeout(() => {
        clearInterval(uploadInterval);
        setUploadProgress(100);
        
        // Simulate API call completion
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadFiles([]);
          setShowUploadModal(false);
          setError('');
          
          // Refresh submissions list
          // In real app, this would be an API call to refresh data
        }, 500);
      }, 2000);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleResubmit = (submission: Submission) => {
    // In real app, this would open upload modal with existing files
    setSelectedAssignment({
      id: submission.assignmentId,
      title: submission.assignmentTitle,
      subject: submission.subject,
      deadline: submission.deadline,
      status: 'pending' as const,
      instructions: '',
      guidelines: ''
    });
    setShowUploadModal(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-600">Track your assignment submissions</p>
        </div>
        
        <motion.button
          onClick={() => setShowUploadModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>New Submission</span>
        </motion.button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission, index) => (
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
                    <h3 className="font-semibold text-gray-900 mb-1">{submission.assignmentTitle}</h3>
                    <p className="text-sm text-gray-600">{submission.subject}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                    
                    {submission.aiSuspicionScore !== undefined && (
                      <div className={`flex items-center space-x-1 text-xs ${
                        submission.aiSuspicionScore > 0.3 ? 'text-red-600' : 
                        submission.aiSuspicionScore > 0.1 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        <span>AI: {(submission.aiSuspicionScore * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Files */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Submitted Files</h4>
                  <div className="space-y-2">
                    {submission.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={() => {
                            // Simulate file download
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            link.click();
                          }}
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
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Teacher Feedback</h4>
                    <p className="text-gray-700">{submission.feedback}</p>
                  </div>
                )}

                {/* Grade */}
                {submission.grade !== undefined && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Grade:</span>
                      <span className="text-2xl font-bold text-green-600">{submission.grade}%</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {submission.status === 'late' && (
                      <span className="text-red-600 font-medium">
                        Submitted after deadline - requires teacher approval
                      </span>
                    )}
                    {submission.status === 'graded' && (
                      <span className="text-green-600 font-medium">
                        Graded and finalized
                      </span>
                    )}
                  </div>
                  
                  {submission.status !== 'graded' && (
                    <motion.button
                      onClick={() => handleResubmit(submission)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">Resubmit</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">You haven't submitted any assignments yet.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setError('');
                    setUploadProgress(0);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Assignment Info */}
              {selectedAssignment && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedAssignment.title}</h3>
                  <p className="text-sm text-gray-600">{selectedAssignment.subject}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${getDeadlineStatus(selectedAssignment.deadline).color}`}>
                      {getDeadlineStatus(selectedAssignment.deadline).text}
                    </span>
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">Select Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={allowedFileTypes.map(type => `.${type}`).join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center space-y-2 text-blue-600 hover:text-blue-700"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="font-medium">Click to upload or drag and drop</span>
                    <span className="text-sm text-gray-600">
                      PDF, DOCX, ZIP, PPTX, Images (Max 50MB)
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Selected Files */}
              {uploadFiles.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Files</h4>
                  <div className="space-y-2">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={() => handleRemoveFile(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Uploading...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <motion.button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setError('');
                    setUploadProgress(0);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleUpload}
                  disabled={isUploading || uploadFiles.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Submit Assignment'}
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
