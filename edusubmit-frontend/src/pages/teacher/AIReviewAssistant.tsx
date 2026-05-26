import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Users,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Target,
  Zap,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  Star,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react';

interface AIAnalysis {
  id: string;
  submissionId: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  analysisType: 'plagiarism' | 'quality' | 'completeness' | 'grading_suggestion';
  status: 'processing' | 'completed' | 'error';
  result?: {
    overallScore: number;
    plagiarismRisk: 'low' | 'medium' | 'high';
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    recommendedGrade: number;
    confidence: number;
    detailedAnalysis: string;
    keyInsights: string[];
  };
  processingTime?: number;
  error?: string;
}

interface GradingInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface BatchAnalysis {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  totalSubmissions: number;
  analyzedSubmissions: number;
  averageScore: number;
  plagiarismCases: number;
  status: 'pending' | 'processing' | 'completed';
  insights: string[];
}

const TeacherAIReviewAssistant: React.FC = () => {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [batchAnalyses, setBatchAnalyses] = useState<BatchAnalysis[]>([]);
  const [insights, setInsights] = useState<GradingInsight[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'plagiarism' | 'quality' | 'completeness' | 'grading_suggestion'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'processing' | 'completed' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch AI analyses
    const fetchAIAnalyses = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockAnalyses: AIAnalysis[] = [
          {
            id: '1',
            submissionId: '1',
            studentName: 'Rahul Kumar',
            assignmentTitle: 'Database Design Project',
            submittedAt: '2026-05-07T14:32:15',
            analysisType: 'plagiarism',
            status: 'completed',
            processingTime: 2.3,
            result: {
              overallScore: 85,
              plagiarismRisk: 'low',
              strengths: [
                'Original database schema design',
                'Proper normalization implementation',
                'Clear documentation and comments'
              ],
              weaknesses: [
                'Missing some edge case handling',
                'Limited error handling in queries'
              ],
              suggestions: [
                'Add input validation for user inputs',
                'Implement proper error logging',
                'Consider adding database indexes for performance'
              ],
              recommendedGrade: 85,
              confidence: 92,
              detailedAnalysis: 'The submission demonstrates strong understanding of database design principles with proper normalization. The ER diagram is well-structured and relationships are correctly implemented. Minor improvements needed in error handling and edge cases.',
              keyInsights: [
                'Shows advanced understanding of normalization',
                'Good practical implementation skills',
                'Needs improvement in robustness'
              ]
            }
          },
          {
            id: '2',
            submissionId: '2',
            studentName: 'Priya Sharma',
            assignmentTitle: 'Algorithm Analysis',
            submittedAt: '2026-05-07T16:45:22',
            analysisType: 'quality',
            status: 'completed',
            processingTime: 1.8,
            result: {
              overallScore: 72,
              plagiarismRisk: 'medium',
              strengths: [
                'Correct algorithm implementation',
                'Good code organization',
                'Proper time complexity analysis'
              ],
              weaknesses: [
                'Limited empirical testing',
                'Missing performance comparisons',
                'Insufficient documentation'
              ],
              suggestions: [
                'Add empirical performance data',
                'Compare with alternative algorithms',
                'Include more detailed comments'
              ],
              recommendedGrade: 72,
              confidence: 85,
              detailedAnalysis: 'The algorithm implementation is correct and well-structured. However, the analysis lacks empirical data and comprehensive comparisons. More testing and documentation would strengthen the submission.',
              keyInsights: [
                'Strong theoretical understanding',
                'Needs more practical validation',
                'Code quality is good but needs refinement'
              ]
            }
          },
          {
            id: '3',
            submissionId: '3',
            studentName: 'Amit Singh',
            assignmentTitle: 'Web Development Lab',
            submittedAt: '2026-05-07T12:20:10',
            analysisType: 'grading_suggestion',
            status: 'processing',
            processingTime: 0
          },
          {
            id: '4',
            submissionId: '4',
            studentName: 'Neha Patel',
            assignmentTitle: 'Machine Learning Assignment',
            submittedAt: '2026-05-07T11:15:45',
            analysisType: 'plagiarism',
            status: 'completed',
            processingTime: 3.1,
            result: {
              overallScore: 45,
              plagiarismRisk: 'high',
              strengths: [
                'Working model implementation',
                'Good data preprocessing'
              ],
              weaknesses: [
                'High similarity to online tutorials',
                'Limited original contributions',
                'Missing proper citations'
              ],
              suggestions: [
                'Add original contributions and improvements',
                'Properly cite sources and references',
                'Explain model architecture in own words'
              ],
              recommendedGrade: 45,
              confidence: 88,
              detailedAnalysis: 'The submission shows significant similarity to publicly available tutorials and code repositories. While the implementation works, there is limited original work. Major revision needed with proper attribution and original contributions.',
              keyInsights: [
                'High plagiarism risk detected',
                'Technical skills are present but not demonstrated originally',
                'Requires academic integrity review'
              ]
            }
          }
        ];

        const mockBatchAnalyses: BatchAnalysis[] = [
          {
            id: '1',
            assignmentId: '1',
            assignmentTitle: 'Database Design Project',
            totalSubmissions: 38,
            analyzedSubmissions: 35,
            averageScore: 78.5,
            plagiarismCases: 2,
            status: 'completed',
            insights: [
              'Class performance is above average',
              '2 cases require manual plagiarism review',
              'Common weakness: error handling implementation'
            ]
          },
          {
            id: '2',
            assignmentId: '2',
            assignmentTitle: 'Algorithm Analysis',
            totalSubmissions: 55,
            analyzedSubmissions: 48,
            averageScore: 71.2,
            plagiarismCases: 5,
            status: 'processing',
            insights: [
              'Analysis in progress...',
              'Initial results show average performance'
            ]
          }
        ];

        const mockInsights: GradingInsight[] = [
          {
            id: '1',
            type: 'pattern',
            title: 'Common Weakness Detected',
            description: 'Multiple submissions show similar issues with error handling in database queries.',
            impact: 'medium',
            actionable: true
          },
          {
            id: '2',
            type: 'anomaly',
            title: 'Unusual Submission Pattern',
            description: '3 submissions submitted within 2 minutes show high similarity scores.',
            impact: 'high',
            actionable: true
          },
          {
            id: '3',
            type: 'recommendation',
            title: 'Grading Efficiency Tip',
            description: 'Consider using AI-suggested grades as baseline and adjust manually.',
            impact: 'low',
            actionable: false
          }
        ];

        setAnalyses(mockAnalyses);
        setBatchAnalyses(mockBatchAnalyses);
        setInsights(mockInsights);
        setLoading(false);
      }, 1500);
    };

    fetchAIAnalyses();
  }, []);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || analysis.analysisType === filterType;
    const matchesStatus = filterStatus === 'all' || analysis.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case 'plagiarism': return 'text-red-600 bg-red-100';
      case 'quality': return 'text-blue-600 bg-blue-100';
      case 'completeness': return 'text-green-600 bg-green-100';
      case 'grading_suggestion': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Review Assistant</h1>
        <p className="text-gray-600 mt-2">AI-powered analysis and grading assistance for submissions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
            </div>
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {analyses.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {analyses.filter(a => a.status === 'processing').length}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600">
                {analyses.filter(a => a.result?.plagiarismRisk === 'high').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student name or assignment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'type' ? null : 'type')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Type: {filterType === 'all' ? 'All' : filterType.replace('_', ' ')}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'type' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                {(['all', 'plagiarism', 'quality', 'completeness', 'grading_suggestion'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 capitalize"
                  >
                    {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'status' ? null : 'status')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Status: {filterStatus === 'all' ? 'All' : filterStatus}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'status' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                {(['all', 'processing', 'completed', 'error'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 capitalize"
                  >
                    {status === 'all' ? 'All Statuses' : status}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Analyses List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent AI Analyses</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAnalyses.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{analysis.studentName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAnalysisTypeColor(analysis.analysisType)}`}>
                          {analysis.analysisType.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                          {analysis.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{analysis.assignmentTitle}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(analysis.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {analysis.processingTime && (
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4" />
                            <span>{analysis.processingTime}s</span>
                          </div>
                        )}
                        {analysis.result && (
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>Score: {analysis.result.overallScore}%</span>
                          </div>
                        )}
                      </div>
                      {analysis.result && (
                        <div className="mt-3 flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.result.plagiarismRisk)}`}>
                            Risk: {analysis.result.plagiarismRisk}
                          </span>
                          <span className="text-xs text-gray-500">
                            Confidence: {analysis.result.confidence}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {analysis.status === 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedAnalysis(analysis);
                            setShowAnalysisModal(true);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          {/* Grading Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${getImpactColor(insight.impact)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      insight.impact === 'high' ? 'bg-red-500' :
                      insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                      {insight.actionable && (
                        <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          Take Action →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Batch Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Batch Analysis</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {batchAnalyses.map((batch) => (
                <div key={batch.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{batch.assignmentTitle}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span>{batch.analyzedSubmissions}/{batch.totalSubmissions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Score:</span>
                      <span>{batch.averageScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plagiarism Cases:</span>
                      <span className="text-red-600">{batch.plagiarismCases}</span>
                    </div>
                  </div>
                  {batch.insights.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">{batch.insights[0]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Details Modal */}
      <AnimatePresence>
        {showAnalysisModal && selectedAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">AI Analysis Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedAnalysis.studentName} • {selectedAnalysis.assignmentTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAnalysisModal(false);
                      setSelectedAnalysis(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {selectedAnalysis.result && (
                <div className="p-6 space-y-6">
                  {/* Overall Score */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedAnalysis.result.overallScore}%</p>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedAnalysis.result.recommendedGrade}</p>
                      <p className="text-sm text-gray-600">Recommended Grade</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{selectedAnalysis.result.confidence}%</p>
                      <p className="text-sm text-gray-600">Confidence</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedAnalysis.result.plagiarismRisk)}`}>
                        {selectedAnalysis.result.plagiarismRisk.toUpperCase()} RISK
                      </span>
                      <p className="text-sm text-gray-600 mt-1">Plagiarism</p>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Detailed Analysis</h3>
                    <p className="text-gray-700">{selectedAnalysis.result.detailedAnalysis}</p>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Key Insights</h3>
                    <div className="space-y-2">
                      {selectedAnalysis.result.keyInsights.map((insight, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-gray-700">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Strengths</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.result.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Weaknesses</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.result.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-gray-700">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Suggestions for Improvement</h3>
                    <ul className="space-y-2">
                      {selectedAnalysis.result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherAIReviewAssistant;
