import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import apiService from '../../services/apiService';
import { 
  Brain,
  Send,
  Clock,
  Lightbulb,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AIConversation {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: string;
  suggestions?: string[];
}

interface AIResponse {
  message: string;
  suggestions?: string[];
}

const AIAssistant = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isTyping]);

  useEffect(() => {
    const loadConversationHistory = async () => {
      setLoading(true);
      
      try {
        // Load conversation history from backend if available
        // For now, start with a welcome message
        const welcomeMessage: AIConversation = {
          id: '1',
          type: 'assistant',
          message: 'Hello! I\'m your AI Study Assistant. I can help you with:\n\n• Understanding difficult concepts\n• Creating study plans\n• Finding learning resources\n• Managing deadlines\n\nWhat would you like help with today?',
          timestamp: new Date().toISOString(),
          suggestions: [
            'Help me understand database normalization',
            'Create a study plan for my exams',
            'What are my upcoming deadlines?'
          ]
        };

        setConversations([welcomeMessage]);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load conversation history:', err);
        setError('Failed to load conversation history. Please refresh the page.');
        setLoading(false);
      }
    };

    loadConversationHistory();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIConversation = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setConversations(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError('');

    try {
      const response = await apiService.getAIAssistantResponse(inputMessage);
      
      const assistantMessage: AIConversation = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: response.message,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions
      };

      setConversations(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (err) {
      console.error('AI response error:', err);
      setError('Failed to get AI response. Please try again.');
      setIsTyping(false);
      
      // Add fallback message
      const errorMessage: AIConversation = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment. If the problem persists, please contact support.',
        timestamp: new Date().toISOString()
      };
      
      setConversations(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Study Assistant</h1>
              <p className="text-sm text-gray-500">Your intelligent learning companion</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <AnimatePresence mode="popLayout">
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`mb-8 ${conversation.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div className={`flex gap-4 max-w-3xl ${conversation.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {conversation.type === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`flex-1 ${conversation.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-6 py-4 rounded-2xl ${
                      conversation.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}>
                      <p className="text-base whitespace-pre-wrap leading-relaxed">{conversation.message}</p>
                    </div>
                    
                    {conversation.suggestions && conversation.type === 'assistant' && (
                      <div className="mt-4 space-y-2">
                        {conversation.suggestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              <span>{suggestion}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs text-gray-400 mt-2 ${conversation.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(conversation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {conversation.type === 'user' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-8"
            >
              <div className="flex gap-4 max-w-3xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-6 py-4 bg-gray-100 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm flex-1">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </motion.div>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
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
                placeholder="Ask me anything about your assignments..."
                className="w-full px-6 py-4 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none text-base"
                disabled={isTyping}
              />
            </div>
            
            <motion.button
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="flex items-center justify-center mt-3 space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Lightbulb className="w-3 h-3" />
              <span>AI can help with assignments and study topics</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
