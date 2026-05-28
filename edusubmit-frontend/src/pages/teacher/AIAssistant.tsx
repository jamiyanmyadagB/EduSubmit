import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Brain,
  Send,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Clock,
  Users,
  Lightbulb
} from 'lucide-react';

interface AIAnalysis {
  id: string;
  submissionId: string;
  studentName: string;
  assignmentTitle: string;
  summary: string;
  guidelineCompliance: {
    score: number;
    missingItems: string[];
    strengths: string[];
    weaknesses: string[];
  };
  qualityAssessment: {
    overallScore: number;
    originality: number;
    structure: number;
    completeness: number;
    relevance: number;
  };
  aiSuspicion: {
    score: number;
    reasons: string[];
    confidence: number;
  };
  suggestedFeedback: string;
  suggestedGrade: number;
  suggestedResources: string[];
  timestamp: string;
}

interface Submission {
  id: string;
  assignmentTitle: string;
  studentName: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'graded' | 'late' | 'ai-suspected';
  files: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>;
}

const AIAssistant = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    message: string;
    timestamp: string;
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch submissions
    const fetchSubmissions = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockSubmissions: Submission[] = [
          {
            id: '1',
            assignmentTitle: 'Database Design Project',
            studentName: 'John Doe',
            submittedAt: '2026-05-14T16:30:00',
            status: 'pending',
            files: [
              {
                id: '1',
                name: 'database_design.pdf',
                size: '2.5 MB',
                type: 'pdf'
              }
            ]
          },
          {
            id: '2',
            assignmentTitle: 'Algorithm Analysis',
            studentName: 'Jane Smith',
            submittedAt: '2026-05-13T14:20:00',
            status: 'reviewed',
            files: [
              {
                id: '2',
                name: 'algorithm_analysis.zip',
                size: '5.2 MB',
                type: 'zip'
              }
            ]
          },
          {
            id: '3',
            assignmentTitle: 'Web Development Assignment',
            studentName: 'Mike Johnson',
            submittedAt: '2026-05-12T11:30:00',
            status: 'graded',
            files: [
              {
                id: '3',
                name: 'webapp.zip',
                size: '8.7 MB',
                type: 'zip'
              }
            ]
          }
        ];

        setSubmissions(mockSubmissions);
        setLoading(false);
      }, 1000);
    };

    fetchSubmissions();
  }, []);

  const handleAnalyzeSubmission = async (submission: Submission) => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Simulate AI analysis
      setTimeout(() => {
        const mockAnalysis: AIAnalysis = {
          id: Date.now().toString(),
          submissionId: submission.id,
          studentName: submission.studentName,
          assignmentTitle: submission.assignmentTitle,
          summary: `The student has submitted a comprehensive ${submission.assignmentTitle.toLowerCase()} with multiple components including database design, implementation, and documentation. The work demonstrates understanding of core concepts but needs improvement in several areas.`,
          
          guidelineCompliance: {
            score: 75,
            missingItems: [
              'Missing proper error handling in database queries',
              'Insufficient testing documentation',
              'No backup strategy mentioned'
            ],
            strengths: [
              'Good database normalization understanding',
              'Clear code structure',
              'Proper use of indexing'
            ],
            weaknesses: [
              'Limited error handling',
              'Missing unit tests',
              'Incomplete documentation'
            ]
          },
          
          qualityAssessment: {
            overallScore: 78,
            originality: 85,
            structure: 82,
            completeness: 70,
            relevance: 85
          },
          
          aiSuspicion: {
            score: 0.15,
            reasons: [
              'Some code patterns appear to be from common tutorials',
              'Variable naming suggests external assistance'
            ],
            confidence: 0.72
          },
          
          suggestedFeedback: `Good overall work on ${submission.assignmentTitle}. The database design is well-structured and follows normalization principles. However, consider adding more comprehensive error handling and unit tests. The implementation could benefit from additional comments explaining complex logic. Documentation should include setup instructions and testing procedures.`,
          
          suggestedGrade: 82,
          
          suggestedResources: [
            'Database Normalization Tutorial - https://example.com/db-normalization',
            'SQL Best Practices Guide - https://example.com/sql-best-practices',
            'Database Testing Strategies - https://example.com/db-testing'
          ],
          
          timestamp: new Date().toISOString()
        };

        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
        
        // Add to conversation history
        setConversations(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'assistant',
            message: `AI analysis complete for ${submission.studentName}'s submission.`,
            timestamp: new Date().toISOString()
          }
        ]);
      }, 2000);
    } catch (err) {
      setError('AI analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setConversations(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse(inputMessage);
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant' as const,
          message: aiResponse,
          timestamp: new Date().toISOString()
        };

        setConversations(prev => [...prev, assistantMessage]);
      }, 1500);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('feedback') || lowerMessage.includes('grade')) {
      return `For grading feedback, I recommend:\n\n1. **Structure your feedback:**\n   - Start with positive reinforcement\n   - Address specific areas for improvement\n   - Provide actionable suggestions\n   - End with encouragement\n\n2. **Grade considerations:**\n   - Evaluate against assignment requirements\n   - Consider effort and improvement\n   - Use rubric-based scoring\n   - Provide explanation for grade\n\n3. **Common feedback areas:**\n   - Code quality and structure\n   - Documentation and comments\n   - Testing and validation\n   - Adherence to guidelines\n\nWould you like me to help draft feedback for a specific submission?`;
    }
    
    if (lowerMessage.includes('suspicion') || lowerMessage.includes('plagiarism')) {
      return `AI Suspicion Analysis Guidelines:\n\n**High Indicators (>30% suspicion):**\n- Identical code patterns across multiple submissions\n- Unusual code formatting consistency\n- Advanced concepts suddenly appearing\n- Perfect grammar with technical content\n\n**Medium Indicators (15-30% suspicion):**\n- Some code from common tutorials\n- Inconsistent coding style\n- Mixed levels of complexity\n\n**Low Indicators (<15% suspicion):**\n- Natural code progression\n- Personal coding style\n- Appropriate complexity level\n- Consistent mistakes and learning patterns\n\n**Recommended Actions:**\n1. Review submission patterns over time\n2. Compare with previous work\n3. Conduct verbal discussion if needed\n4. Use as teaching opportunity, not punishment\n\n**Important:** AI scores should support, not replace, your professional judgment.`;
    }
    
    if (lowerMessage.includes('assignment') || lowerMessage.includes('create')) {
      return `Assignment Creation Best Practices:\n\n**Clear Instructions:**\n- Break down complex tasks into smaller steps\n- Provide specific requirements and constraints\n- Include evaluation criteria\n- Give examples of expected output\n\n**Realistic Deadlines:**\n- Consider student workload\n- Account for other assignments\n- Build in buffer time for questions\n- Avoid clustering major deadlines\n\n**Effective Guidelines:**\n- Specify required tools and technologies\n- Provide templates or starting points\n- Include formatting and submission requirements\n- Add academic integrity expectations\n\n**Assessment Alignment:**\n- Match assignments to learning objectives\n- Create rubric-based evaluation\n- Include both technical and soft skill assessment\n\nWould you like help creating a rubric or specific assignment guidelines?`;
    }
    
    return `I'm here to help with teaching and assessment tasks. I can assist with:\n\n📚 **Assignment Design**\n📝 **Feedback Composition**\n🔍 **Plagiarism Detection**\n📊 **Grade Calibration**\n\nHow can I help you improve your teaching workflow today?`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSuspicionColor = (score: number) => {
    if (score > 0.3) return 'text-red-600 bg-red-50';
    if (score > 0.15) return 'text-orange-600 bg-orange-50';
    if (score > 0.1) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Review Assistant</h1>
        <p className="text-gray-600">AI-powered grading assistance and teaching insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Selection */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Submission</h2>
            <p className="text-sm text-gray-600">Choose a submission to analyze with AI</p>
          </div>
          
          <div className="space-y-3">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: submissions.indexOf(submission) * 0.1 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSubmission?.id === submission.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{submission.assignmentTitle}</h3>
                    <p className="text-sm text-gray-600">{submission.studentName}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'graded' ? 'bg-green-100 text-green-700' :
                      submission.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {submission.status}
                    </span>
                    
                    {submission.status === 'graded' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedSubmission && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <motion.button
                onClick={() => handleAnalyzeSubmission(selectedSubmission)}
                disabled={isAnalyzing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Brain className="w-5 h-5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}</span>
              </motion.button>
            </motion.div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </GlassCard>

        {/* AI Analysis Results */}
        {analysis && (
          <GlassCard>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis Results</h2>
              <p className="text-sm text-gray-600">
                Analysis for {analysis.studentName} - {analysis.assignmentTitle}
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-700">{analysis.summary}</p>
              </div>

              {/* Guideline Compliance */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Guideline Compliance</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Compliance Score</span>
                  <span className={`text-lg font-bold ${getQualityColor(analysis.guidelineCompliance.score)}`}>
                    {analysis.guidelineCompliance.score}%
                  </span>
                </div>
                
                {analysis.guidelineCompliance.missingItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">Missing Items:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {analysis.guidelineCompliance.missingItems.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.guidelineCompliance.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">Strengths:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {analysis.guidelineCompliance.strengths.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quality Assessment */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Quality Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Overall</p>
                    <p className={`text-lg font-bold ${getQualityColor(analysis.qualityAssessment.overallScore)}`}>
                      {analysis.qualityAssessment.overallScore}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Originality</p>
                    <p className={`text-lg font-bold ${getQualityColor(analysis.qualityAssessment.originality)}`}>
                      {analysis.qualityAssessment.originality}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Structure</p>
                    <p className={`text-lg font-bold ${getQualityColor(analysis.qualityAssessment.structure)}`}>
                      {analysis.qualityAssessment.structure}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completeness</p>
                    <p className={`text-lg font-bold ${getQualityColor(analysis.qualityAssessment.completeness)}`}>
                      {analysis.qualityAssessment.completeness}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Relevance</p>
                    <p className={`text-lg font-bold ${getQualityColor(analysis.qualityAssessment.relevance)}`}>
                      {analysis.qualityAssessment.relevance}%
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Suspicion */}
              <div className={`p-4 rounded-lg ${getSuspicionColor(analysis.aiSuspicion.score)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">AI Suspicion Score</h3>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span className={`text-lg font-bold`}>
                      {(analysis.aiSuspicion.score * 100).toFixed(0)}%
                    </span>
                    <span className="text-sm">
                      ({analysis.aiSuspicion.confidence * 100}% confidence)
                    </span>
                  </div>
                </div>
                
                {analysis.aiSuspicion.reasons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Detection Reasons:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {analysis.aiSuspicion.reasons.map((reason, index) => (
                        <li key={index} className="text-sm">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Suggested Feedback */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Suggested Feedback</h3>
                  <motion.button
                    onClick={() => copyToClipboard(analysis.suggestedFeedback)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy</span>
                  </motion.button>
                </div>
                <p className="text-sm text-gray-700">{analysis.suggestedFeedback}</p>
              </div>

              {/* Suggested Grade */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Suggested Grade</h3>
                  <span className={`text-lg font-bold ${getQualityColor(analysis.suggestedGrade)}`}>
                    {analysis.suggestedGrade}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Important:</strong> This is a suggested grade based on AI analysis. 
                  You should review the submission yourself and make the final grading decision.
                  Consider the student's effort, improvement, and individual circumstances.
                </p>
              </div>

              {/* Suggested Resources */}
              {analysis.suggestedResources.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Learning Resources for Student</h3>
                  <div className="space-y-2">
                    {analysis.suggestedResources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{resource}</p>
                        </div>
                        <motion.button
                          onClick={() => window.open(resource, '_blank')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Open Resource
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </GlassCard>
        )}

        {/* AI Chat Assistant */}
        <GlassCard>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Teaching Assistant</h2>
            <p className="text-sm text-gray-600">Ask me for help with grading, feedback, or assignment creation</p>
          </div>
          
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.button
                onClick={() => setInputMessage('Help me write feedback for a submission')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Draft Feedback</span>
              </motion.button>
              
              <motion.button
                onClick={() => setInputMessage('Help me detect AI-generated content')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm">Check AI Content</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => setInputMessage('Help me create assignment guidelines')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">Assignment Guidelines</span>
              </motion.button>
              
              <motion.button
                onClick={() => setInputMessage('Help me calibrate grades for consistency')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Grade Calibration</span>
              </motion.button>
            </div>
          </div>

            {/* Chat Interface */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {conversations.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: conversations.indexOf(message) * 0.1 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask for teaching assistance..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </motion.button>
              </div>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AIAssistant;
