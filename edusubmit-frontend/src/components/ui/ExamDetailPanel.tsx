import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Send, Bot, Upload, CheckCircle, AlertCircle } from 'lucide-react';

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

interface ExamDetailPanelProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitAssignment: (examId: string, file: File) => Promise<void>;
  onAskAI: (examId: string, question: string) => Promise<string>;
}

/**
 * Exam detail panel component
 * Shows exam requirements, teacher files, submission system, and AI help
 */
const ExamDetailPanel: React.FC<ExamDetailPanelProps> = ({
  exam,
  isOpen,
  onClose,
  onSubmitAssignment,
  onAskAI
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiError, setAiError] = useState('');
  const [showAI, setShowAI] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError('Only PDF, DOCX, and ZIP files are allowed');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setSubmitError('');
      setSubmitSuccess(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !exam) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      await onSubmitAssignment(exam.id, selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSubmitSuccess(true);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setSubmitError('Failed to submit assignment. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setUploadProgress(0);
        setSubmitSuccess(false);
      }, 3000);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !exam) return;
    
    setIsAiThinking(true);
    setAiError('');
    
    try {
      const response = await onAskAI(exam.id, aiQuestion);
      setAiResponse(response);
    } catch (error) {
      setAiError('Failed to get AI response. Please try again.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleDownloadFile = (file: any) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  if (!exam) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side - Exam details */}
            <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{exam.title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Status and deadline */}
              <div className="flex items-center space-x-4 mb-6">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  exam.status === 'submitted' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {exam.status === 'submitted' ? 'Submitted' : 'Pending'}
                </div>
                <div className="text-sm text-gray-600">
                  Deadline: {new Date(exam.deadline).toLocaleDateString()}
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Assignment Requirements
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {exam.requirements || 'Complete the assignment according to the guidelines provided in class.'}
                  </p>
                </div>
              </div>

              {/* Teacher files */}
              {exam.teacherFiles && exam.teacherFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Teacher Files</h3>
                  <div className="space-y-2">
                    {exam.teacherFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission section */}
              {exam.status === 'pending' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Submit Assignment</h3>
                  
                  {/* File upload */}
                  <div className="mb-4">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.zip"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200 cursor-pointer ${
                        selectedFile ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOCX, ZIP (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Upload progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
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

                  {/* Success message */}
                  {submitSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800">Assignment submitted successfully!</span>
                    </div>
                  )}

                  {/* Error message */}
                  {submitError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">{submitError}</span>
                    </div>
                  )}

                  {/* Submit button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isSubmitting || submitSuccess}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Assignment</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {exam.status === 'submitted' && (
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium">Assignment already submitted</p>
                </div>
              )}
            </div>

            {/* Right side - AI Help */}
            <div className="w-96 bg-gray-50 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-purple-600" />
                  AI Assistant
                </h3>
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {showAI && (
                <div className="flex-1 flex flex-col">
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {aiResponse && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-start space-x-2">
                          <Bot className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {aiError && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-sm text-red-700">{aiError}</p>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                      placeholder="Ask about this assignment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={isAiThinking}
                    />
                    <motion.button
                      onClick={handleAskAI}
                      disabled={!aiQuestion.trim() || isAiThinking}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAiThinking ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>

                  {/* Typing indicator */}
                  {isAiThinking && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <span className="ml-1">AI is thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExamDetailPanel;
