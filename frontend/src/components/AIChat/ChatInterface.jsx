// components/AIChat/ChatInterface.jsx - Complete with WebSocket message handling
import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic, FiMicOff, FiMessageSquare, FiCompass, FiMapPin, FiCalendar, FiDollarSign, FiZap, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/index';
import { aiAPI } from '../../api/ai';

const ChatInterface = ({ 
  onSendMessage, 
  onHttpChat, 
  conversationId, 
  isConnected, 
  userId, 
  userName 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: userName 
        ? `Hello ${userName}! I'm your AI travel assistant. How can I help you plan your next adventure?`
        : "Hello! I'm your AI travel assistant. How can I help you plan your next adventure?",
      sender: 'ai',
      timestamp: new Date(),
      isAI: true,
      isMock: false,
      isStreaming: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const questionsContainerRef = useRef(null);
  const streamRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ WebSocket message handler
  useEffect(() => {
    // Global message handler for WebSocket responses
    window.chatMessageHandler = (data) => {
      console.log('📥 WebSocket message received:', data.type);
      
      switch (data.type) {
        case 'chunk':
          // Append chunk to current AI message
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.sender === 'ai' && last.isStreaming) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                text: last.text + (data.chunk || '')
              };
              return updated;
            }
            return prev;
          });
          break;
          
        case 'complete':
          // Mark message as complete
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.sender === 'ai') {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                isStreaming: false,
                timestamp: new Date()
              };
              return updated;
            }
            return prev;
          });
          setIsAITyping(false);
          setIsLoading(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          // Update conversation ID
          if (data.conversation_id) {
            setCurrentConversationId(data.conversation_id);
          }
          break;
          
        case 'typing':
          setIsAITyping(data.is_typing);
          break;
          
        case 'connected':
          console.log('✅ Connected to server:', data.message);
          break;
          
        case 'authenticated':
          console.log('✅ Authenticated as:', data.user_name);
          break;
          
        case 'error':
          console.error('❌ Server error:', data.message);
          setError(data.message);
          setIsAITyping(false);
          setIsLoading(false);
          break;
          
        default:
          console.log('ℹ️ Unhandled message type:', data.type);
      }
    };

    return () => {
      window.chatMessageHandler = null;
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  // Update conversation ID from props
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
    }
  }, [conversationId]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setInputText(prev => prev + ' ' + transcript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Suggested questions - travel related only
  const quickQuestions = [
    {
      id: 1,
      text: "What are the best budget-friendly destinations?",
      icon: <FiDollarSign className="w-4 h-4" />,
    },
    {
      id: 2,
      text: "Plan a 5-day trip to Paris",
      icon: <FiCalendar className="w-4 h-4" />,
    },
    {
      id: 3,
      text: "Visa requirements for Nigerian passport",
      icon: <FiCompass className="w-4 h-4" />,
    },
    {
      id: 4,
      text: "Best time to visit Cape Town",
      icon: <FiMapPin className="w-4 h-4" />,
    },
    {
      id: 5,
      text: "Solo travel safety tips for women",
      icon: <FiMessageSquare className="w-4 h-4" />,
    },
    {
      id: 6,
      text: "Family-friendly resorts in Dubai",
      icon: <FiMessageSquare className="w-4 h-4" />,
    }
  ];

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle sending message via WebSocket
  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading || isAITyping) return;
    
    const userMessageText = inputText.trim();
    
    // Clear any previous errors
    setError(null);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      isAI: false,
      isStreaming: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsAITyping(true);
    
    try {
      // Try WebSocket first
      if (onSendMessage && isConnected) {
        const sent = onSendMessage(userMessageText, {
          user_id: userId,
          user_name: userName,
          conversation_id: currentConversationId
        });
        
        if (sent) {
          // Add placeholder for AI response
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: '',
            sender: 'ai',
            timestamp: new Date(),
            isStreaming: true,
            isAI: true,
            isMock: false
          }]);
          
          // Set timeout to hide typing indicator if no response
          typingTimeoutRef.current = setTimeout(() => {
            setIsAITyping(false);
            setIsLoading(false);
          }, 15000);
          
          return;
        }
      }
      
      // Fallback to HTTP
      if (onHttpChat) {
        const response = await onHttpChat(userMessageText, {
          user_id: userId,
          user_name: userName
        });
        
        setIsAITyping(false);
        
        const aiMessage = {
          id: Date.now() + 1,
          text: response.response || response.message || "I received your message!",
          sender: 'ai',
          timestamp: new Date(),
          isAI: true,
          isMock: false,
          isStreaming: false
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setIsAITyping(false);
    } finally {
      setIsLoading(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleQuickQuestion = (questionText) => {
    setInputText(questionText);
    inputRef.current?.focus();
    
    // Auto-send after brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 500);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks = [];
      setAudioChunks(chunks);
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      recorder.onstop = async () => {
        if (recognition) {
          recognition.start();
        }
      };
      
      recorder.start();
      setIsRecording(true);
      
      if (recognition) {
        recognition.start();
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice recording.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (recognition) {
      recognition.stop();
    }
    
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startVoiceRecording();
    } else {
      stopVoiceRecording();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      text: userName 
        ? `Hello ${userName}! I'm your AI travel assistant. How can I help you plan your next adventure?`
        : "Hello! I'm your AI travel assistant. How can I help you plan your next adventure?",
      sender: 'ai',
      timestamp: new Date(),
      isAI: true,
      isMock: false,
      isStreaming: false
    }]);
    setCurrentConversationId(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(94vh-200px)]">
      {/* Error Banner */}
      {error && (
        <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-slideIn">
          <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto pt-2 px-1 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[95%] rounded-2xl px-4 py-3 relative ${
                  message.sender === 'user'
                    ? 'bg-[#064473] text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {/* AI/Mock indicator */}
                {message.sender === 'ai' && !message.isStreaming && (
                  <div className="absolute -top-2 -left-2 flex gap-1">
                    {message.isAI ? (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <FiZap className="w-2 h-2" />
                        AI
                      </span>
                    ) : message.isMock && (
                      <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full flex items-center gap-1">
                        <FiMessageSquare className="w-2 h-2" />
                        Demo
                      </span>
                    )}
                  </div>
                )}
                
                {/* Streaming indicator */}
                {message.sender === 'ai' && message.isStreaming && (
                  <div className="absolute -top-2 -left-2">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1 animate-pulse">
                      <FiZap className="w-2 h-2" />
                      Typing...
                    </span>
                  </div>
                )}
                
                <p className="text-sm md:text-base whitespace-pre-wrap">
                  {message.text}
                  {message.isStreaming && <span className="ml-1 animate-pulse">▊</span>}
                </p>
                <div className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.sender === 'ai' && message.isMock && (
                    <span className="ml-2 text-yellow-600">• Demo mode</span>
                  )}
                  {message.sender === 'ai' && message.isAI && !message.isMock && !message.isStreaming && (
                    <span className="ml-2 text-green-600">• AI generated</span>
                  )}
                  {message.isStreaming && (
                    <span className="ml-2 text-blue-600 animate-pulse">• Streaming...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* AI Typing Indicator */}
          {isAITyping && !messages.some(m => m.isStreaming) && (
            <div className="flex justify-start">
              <div className="max-w-[95%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-800 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FiMessageSquare className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Quick Suggestions</h3>
        </div>
        <div 
          ref={questionsContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {quickQuestions.map((question) => (
            <button
              key={question.id}
              onClick={() => handleQuickQuestion(question.text)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full hover:border-[#064473] hover:bg-[#064473]/5 transition-all text-sm whitespace-nowrap flex-shrink-0"
              disabled={isLoading || isAITyping}
            >
              {question.icon}
              <span>{question.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="mt-auto">
        <div className="relative">
          {/* Voice Recording Indicator */}
          {isRecording && (
            <div className="absolute -top-10 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <FiMic className="w-4 h-4" />
                <span className="text-sm">Listening...</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {/* Voice Recording Button */}
            <button
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
              disabled={isLoading || isAITyping}
            >
              {isRecording ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
              
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></div>
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isAITyping ? "AI is responding..." : "Ask about travel, destinations, or itineraries..."}
                className={`w-full pl-4 pr-14 py-3 pb-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064473] focus:border-transparent resize-none ${
                  isAITyping ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                rows="1"
                disabled={isLoading || isAITyping}
              />
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={inputText.trim() === '' || isLoading || isAITyping}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() === '' || isLoading || isAITyping
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#064473] text-white hover:bg-[#064473]/90'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Connection status */}
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
            {isAITyping && (
              <span className="ml-2 text-[#064473] animate-pulse">• AI typing...</span>
            )}
          </div>
          <button
            onClick={clearChat}
            className="text-[#064473] hover:underline text-xs"
            disabled={isLoading || isAITyping}
          >
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;