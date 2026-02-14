// pages/AIChatPage.jsx - COMPLETE WORKING VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import BottomNav from '../components/Layout/BottomNav';
import ChatInterface from '../components/AIChat/ChatInterface';
import { aiAPI } from '../api/ai';
import { useAuth } from '../context/AuthContext';

const AIChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [wsConnection, setWsConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    if (user) {
      connectWebSocket();
    }

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    try {
      const ws = aiAPI.createChatWebSocket();
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📥 WebSocket message:', data.type);
          
          // ✅ Pass directly to ChatInterface via global handler
          if (window.chatMessageHandler) {
            window.chatMessageHandler(data);
          }
          
          // Update conversation ID if provided
          if (data.conversation_id) {
            setConversationId(data.conversation_id);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected: ${event.code}`);
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (user) {
            console.log('🔄 Reconnecting WebSocket...');
            connectWebSocket();
          }
        }, 3000);
      };

      setWsConnection(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  // Send message via WebSocket
  const sendWebSocketMessage = (message, context = null) => {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'message',
        message,
        conversation_id: conversationId,
        context: context || {
          user_id: user?.id,
          user_name: user?.first_name,
          timestamp: new Date().toISOString()
        }
      };
      
      wsConnection.send(JSON.stringify(payload));
      console.log('📤 Message sent:', message.substring(0, 30) + '...');
      return true;
    }
    console.warn('❌ WebSocket not ready');
    return false;
  };

  // Fallback HTTP chat
  const sendHttpChat = async (message, context = null) => {
    try {
      const request = {
        message,
        conversation_id: conversationId,
        context: context || {
          user_id: user?.id,
          user_name: user?.first_name,
          timestamp: new Date().toISOString()
        },
        stream: false
      };
      
      const response = await aiAPI.chat(request, () => {});
      
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      return response;
    } catch (error) {
      console.error('HTTP chat error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Navbar title="AI Assistant" user={user} />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full px-4 pt-4">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-4 flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Travel AI Assistant
              </h1>
              <p className="text-sm text-gray-600">
                Ask me anything about travel planning or destinations
              </p>
              
              {/* Connection Status */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
                }`} />
                <span className="text-xs text-gray-600">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
                {user && (
                  <span className="text-xs text-gray-500 ml-2">
                    Logged in as {user.first_name}
                  </span>
                )}
              </div>
            </div>
            
            {/* Chat Interface - Let it manage its own messages */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface 
                onSendMessage={sendWebSocketMessage}
                onHttpChat={sendHttpChat}
                conversationId={conversationId}
                isConnected={isConnected}
                userId={user?.id}
                userName={user?.first_name}
              />
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default AIChatPage;