import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedBackground from '../components/3D/AnimatedBackground';
import { 
  Plus, 
  X, 
  Calendar,
  Clock,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';

interface AssignmentStep {
  id: number;
  title: string;
  description: string;
}

interface Question {
  id: string;
  type: 'text' | 'file' | 'multiple-choice';
  question: string;
  options?: string[];
  maxScore: number;
}

const CreateAssignment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    dueTime: '',
    maxScore: 100,
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10,
    instructions: '',
    questions: [] as Question[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const steps: AssignmentStep[] = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Set up assignment details and requirements'
    },
    {
      id: 2,
      title: 'Questions & Tasks',
      description: 'Create questions and tasks for students'
    },
    {
      id: 3,
      title: 'Settings & Rules',
      description: 'Configure submission rules and grading'
    },
    {
      id: 4,
      title: 'Review & Publish',
      description: 'Review and publish your assignment'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      maxScore: 10
    };
    setAssignmentData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setAssignmentData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (id: string) => {
    setAssignmentData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/teacher-dashboard');
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                value={assignmentData.title}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter assignment title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                value={assignmentData.description}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                placeholder="Describe the assignment objectives and requirements"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Subject
                </label>
                <select
                  value={assignmentData.subject}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select subject</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Maximum Score
                </label>
                <input
                  type="number"
                  value={assignmentData.maxScore}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={assignmentData.dueDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Due Time
                </label>
                <input
                  type="time"
                  value={assignmentData.dueTime}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, dueTime: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Questions & Tasks</h3>
              <AnimatedButton
                onClick={addQuestion}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </AnimatedButton>
            </div>

            <AnimatePresence>
              {assignmentData.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-white font-medium">Question {index + 1}</h4>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your question"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="text">Text Answer</option>
                        <option value="file">File Upload</option>
                        <option value="multiple-choice">Multiple Choice</option>
                      </select>

                      <input
                        type="number"
                        value={question.maxScore}
                        onChange={(e) => updateQuestion(question.id, { maxScore: parseInt(e.target.value) })}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Max score"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {assignmentData.questions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No questions added yet</p>
                <p className="text-gray-400 text-sm">Click "Add Question" to get started</p>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Instructions
              </label>
              <textarea
                value={assignmentData.instructions}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                placeholder="Provide detailed instructions for students"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Allowed File Types
                </label>
                <div className="space-y-2">
                  {['pdf', 'doc', 'docx', 'txt', 'zip'].map((fileType) => (
                    <label key={fileType} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={assignmentData.allowedFileTypes.includes(fileType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignmentData(prev => ({
                              ...prev,
                              allowedFileTypes: [...prev.allowedFileTypes, fileType]
                            }));
                          } else {
                            setAssignmentData(prev => ({
                              ...prev,
                              allowedFileTypes: prev.allowedFileTypes.filter(t => t !== fileType)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-300">.{fileType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={assignmentData.maxFileSize}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white">Review Assignment</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">{assignmentData.title || 'Untitled Assignment'}</h4>
                <p className="text-gray-300 text-sm mb-3">{assignmentData.description || 'No description provided'}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Subject:</span>
                    <span className="text-white ml-2">{assignmentData.subject || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Score:</span>
                    <span className="text-white ml-2">{assignmentData.maxScore} points</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Due Date:</span>
                    <span className="text-white ml-2">{assignmentData.dueDate || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Questions:</span>
                    <span className="text-white ml-2">{assignmentData.questions.length}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">Questions Summary</h4>
                {assignmentData.questions.map((question, index) => (
                  <div key={question.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                    <span className="text-gray-300 text-sm">Question {index + 1}: {question.question || 'Untitled'}</span>
                    <span className="text-white text-sm">{question.maxScore} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Create Assignment</h1>
          <p className="text-gray-300">Design and publish assignments for your students</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  className="flex flex-col items-center"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentStep(step.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white/20 text-gray-400'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.id}
                  </motion.div>
                  <span className={`text-xs mt-2 ${
                    currentStep >= step.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <motion.div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-blue-500' : 'bg-white/20'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <GlassCard>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-300 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <AnimatedButton
              onClick={handlePrevious}
              variant="secondary"
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </AnimatedButton>

            <div className="flex gap-2">
              {currentStep === steps.length ? (
                <AnimatedButton
                  onClick={handleSubmit}
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Publish Assignment
                    </>
                  )}
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  onClick={handleNext}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </AnimatedButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default CreateAssignment;
