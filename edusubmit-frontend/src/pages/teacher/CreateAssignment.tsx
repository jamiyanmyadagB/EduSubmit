import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { 
  Plus, 
  X, 
  Calendar,
  Clock,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Save,
  Users,
  BookOpen
} from 'lucide-react';

interface AssignmentStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface Question {
  id: string;
  type: 'text' | 'file' | 'multiple-choice' | 'essay';
  question: string;
  options?: string[];
  maxScore: number;
  required: boolean;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  instructions: string;
  guidelines: string;
  deadline: string;
  maxMarks: number;
  assignedSections: string[];
  attachedFiles: Array<{
    id: string;
    name: string;
    url: string;
    size: string;
  }>;
  questions: Question[];
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

const CreateAssignment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assignment, setAssignment] = useState<Assignment>({
    id: '',
    title: '',
    subject: '',
    description: '',
    instructions: '',
    guidelines: '',
    deadline: '',
    maxMarks: 100,
    assignedSections: [],
    attachedFiles: [],
    questions: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [sections, setSections] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const steps: AssignmentStep[] = [
    { id: 1, title: 'Basic Information', description: 'Title, subject, description', completed: false },
    { id: 2, title: 'Instructions & Guidelines', description: 'Detailed instructions and guidelines', completed: false },
    { id: 3, title: 'Settings', description: 'Deadline, marks, sections', completed: false },
    { id: 4, title: 'Questions', description: 'Add assignment questions', completed: false },
    { id: 5, title: 'Attachments', description: 'Upload supporting files', completed: false },
    { id: 6, title: 'Review & Publish', description: 'Review and publish assignment', completed: false }
  ];

  useEffect(() => {
    // Simulate fetching sections
    const mockSections = [
      { id: '1', name: 'CSE-A' },
      { id: '2', name: 'CSE-B' },
      { id: '3', name: 'AIML-1' },
      { id: '4', name: 'CSE-C' }
    ];
    setSections(mockSections);
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(assignment.title && assignment.subject && assignment.description);
      case 2:
        return !!(assignment.instructions && assignment.guidelines);
      case 3:
        return !!(assignment.deadline && assignment.maxMarks && assignment.assignedSections?.length > 0);
      case 4:
        return !!(assignment.questions?.length > 0);
      case 5:
        return true; // Attachments are optional
      case 6:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      setErrors({ ...errors, [currentStep]: 'Please complete all required fields' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({ ...errors, [currentStep - 1]: '' });
  };

  const handleInputChange = (field: string, value: any) => {
    setAssignment({ ...assignment, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      maxScore: 10,
      required: true
    };
    setAssignment({ ...assignment, questions: [...assignment.questions, newQuestion] });
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    setAssignment({
      ...assignment,
      questions: assignment.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  const removeQuestion = (questionId: string) => {
    setAssignment({
      ...assignment,
      questions: assignment.questions.filter(q => q.id !== questionId)
    });
  };

  const handleSectionToggle = (sectionId: string) => {
    const isSelected = assignment.assignedSections.includes(sectionId);
    if (isSelected) {
      setAssignment({
        ...assignment,
        assignedSections: assignment.assignedSections.filter(id => id !== sectionId)
      });
    } else {
      setAssignment({
        ...assignment,
        assignedSections: [...assignment.assignedSections, sectionId]
      });
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to save draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Assignment draft saved');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateStep(6)) {
      setErrors({ ...errors, 6: 'Please complete all required fields before publishing' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to publish assignment
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Assignment published:', assignment);
      navigate('/assignments');
    } catch (error) {
      console.error('Error publishing assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title *</label>
              <input
                type="text"
                value={assignment.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter assignment title"
              />
              {errors[1] && <p className="text-red-600 text-sm mt-1">{errors[1]}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <input
                type="text"
                value={assignment.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Database Systems"
              />
              {errors[1] && <p className="text-red-600 text-sm mt-1">{errors[1]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={assignment.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Provide a clear description of the assignment"
              />
              {errors[1] && <p className="text-red-600 text-sm mt-1">{errors[1]}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
              <textarea
                value={assignment.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Provide detailed instructions for completing the assignment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guidelines</label>
              <textarea
                value={assignment.guidelines}
                onChange={(e) => handleInputChange('guidelines', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Provide guidelines, formatting requirements, and submission expectations"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
                <input
                  type="datetime-local"
                  value={assignment.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Marks *</label>
                <input
                  type="number"
                  value={assignment.maxMarks}
                  onChange={(e) => handleInputChange('maxMarks', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Sections *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sections.map(section => (
                  <label key={section.id} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={assignment.assignedSections.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">{section.name}</span>
                  </label>
                ))}
              </div>
              {errors[3] && <p className="text-red-600 text-sm mt-1">{errors[3]}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assignment Questions</h3>
              <AnimatedButton
                onClick={addQuestion}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </AnimatedButton>
            </div>

            <div className="space-y-4">
              {assignment.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter question"
                        />
                        
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="text">Text</option>
                          <option value="file">File Upload</option>
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="essay">Essay</option>
                        </select>

                        <div className="flex items-center space-x-4 mt-2">
                          <input
                            type="number"
                            value={question.maxScore}
                            onChange={(e) => updateQuestion(question.id, 'maxScore', parseInt(e.target.value))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            min="1"
                            placeholder="Max Score"
                          />
                          
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">Required</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
              <AnimatedButton
                onClick={() => {/* File upload logic */}}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </AnimatedButton>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Drag and drop files here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>

            {assignment.attachedFiles.length > 0 && (
              <div className="space-y-2">
                {assignment.attachedFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">({file.size})</span>
                    </div>
                    <button
                      onClick={() => {/* Remove file logic */}}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Review Assignment</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Title:</span>
                      <p className="font-medium">{assignment.title || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Subject:</span>
                      <p className="font-medium">{assignment.subject || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Deadline:</span>
                      <p className="font-medium">{assignment.deadline || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Max Marks:</span>
                      <p className="font-medium">{assignment.maxMarks || 'Not set'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Assigned Sections:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {assignment.assignedSections.map(sectionId => {
                        const section = sections.find(s => s.id === sectionId);
                        return section ? (
                          <span key={sectionId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {section.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Questions:</span>
                    <p className="font-medium">{assignment.questions.length} questions</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Attachments:</span>
                    <p className="font-medium">{assignment.attachedFiles.length} files</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/assignments')}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : currentStep > step.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ${currentStep > step.id ? 'bg-purple-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard>
              <div className="p-6">
                {renderStepContent()}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <AnimatedButton
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </AnimatedButton>

          <div className="flex space-x-3">
            {currentStep < 6 && (
              <AnimatedButton
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <span>{currentStep === 6 ? 'Publish' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </AnimatedButton>
            )}
            
            {currentStep === 1 && (
              <AnimatedButton
                onClick={handleSaveDraft}
                disabled={isLoading}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </AnimatedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
