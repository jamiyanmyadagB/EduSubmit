import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedBackground from '../components/3D/AnimatedBackground';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Download,
  Eye
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface AIFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

const SubmitAssignment = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    }));

    setFiles(prev => [...prev, ...newFiles]);
    simulateUpload(newFiles);
  };

  const simulateUpload = (filesToUpload: UploadedFile[]) => {
    setIsUploading(true);
    
    filesToUpload.forEach((file, index) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: Math.min(f.progress + 10, 100) }
            : f
        ));
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ));
        
        if (index === filesToUpload.length - 1) {
          setIsUploading(false);
          generateAIFeedback();
        }
      }, 2000);
    });
  };

  const generateAIFeedback = () => {
    setTimeout(() => {
      setAiFeedback({
        score: 85,
        strengths: [
          'Clear problem statement and objectives',
          'Well-structured code with proper documentation',
          'Good use of modern development practices'
        ],
        improvements: [
          'Add more comprehensive error handling',
          'Consider optimizing database queries',
          'Include unit tests for better coverage'
        ],
        suggestions: [
          'Try implementing caching for better performance',
          'Consider using TypeScript for type safety',
          'Add responsive design for mobile devices'
        ]
      });
      setShowFeedback(true);
    }, 1500);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = () => {
    // Handle submission logic here
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Submit Assignment</h1>
          <p className="text-gray-300">Upload your work and get instant AI feedback</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload Files
              </h2>

              {/* Drag and Drop Area */}
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-400 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">
                    Drag & drop your files here
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <div className="inline-block">
                      <AnimatedButton variant="secondary" size="sm">
                        Choose Files
                      </AnimatedButton>
                    </div>
                  </label>
                </motion.div>
              </motion.div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-3"
                  >
                    <h3 className="text-white font-medium mb-3">Uploaded Files</h3>
                    {files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <File className="w-5 h-5 text-blue-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{file.name}</p>
                            <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {file.status === 'uploading' && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                            />
                          )}
                          
                          {file.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                          
                          {file.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                          
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <AnimatedButton
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={files.length === 0 || isUploading}
                >
                  {isUploading ? 'Processing...' : 'Submit Assignment'}
                </AnimatedButton>
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* AI Feedback Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                AI Feedback
              </h2>

              {!showFeedback ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-300">
                    Upload your files to get instant AI-powered feedback
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {aiFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {/* Score */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                      >
                        <div className="relative inline-block">
                          <motion.div
                            className="w-32 h-32 rounded-full border-4 border-purple-500 flex items-center justify-center"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, delay: 0.3 }}
                          >
                            <span className="text-3xl font-bold text-white">
                              {aiFeedback.score}
                            </span>
                          </motion.div>
                          <motion.div
                            className="absolute inset-0 rounded-full border-4 border-purple-400 opacity-50"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                        <p className="text-gray-300 mt-2">Overall Score</p>
                      </motion.div>

                      {/* Strengths */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h3 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Strengths
                        </h3>
                        <ul className="space-y-2">
                          {aiFeedback.strengths.map((strength, index) => (
                            <motion.li
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="text-gray-300 text-sm flex items-start gap-2"
                            >
                              <span className="text-green-400 mt-1">•</span>
                              {strength}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Improvements */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <h3 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Areas for Improvement
                        </h3>
                        <ul className="space-y-2">
                          {aiFeedback.improvements.map((improvement, index) => (
                            <motion.li
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className="text-gray-300 text-sm flex items-start gap-2"
                            >
                              <span className="text-yellow-400 mt-1">•</span>
                              {improvement}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Suggestions */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <h3 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Suggestions
                        </h3>
                        <ul className="space-y-2">
                          {aiFeedback.suggestions.map((suggestion, index) => (
                            <motion.li
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                              className="text-gray-300 text-sm flex items-start gap-2"
                            >
                              <span className="text-blue-400 mt-1">•</span>
                              {suggestion}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Actions */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex gap-3"
                      >
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Report
                        </AnimatedButton>
                        
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Detailed Analysis
                        </AnimatedButton>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssignment;
