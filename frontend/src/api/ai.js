// api/ai.js - Complete WebSocket & HTTP Chat Integration
import api, { WS_BASE_URL } from './index';

export const aiAPI = {
  /**
   * Chat with AI assistant - Streaming & Non-streaming
   * @param {Object} request - { message, conversation_id, context, stream }
   * @param {Function} onChunk - Callback for streaming chunks
   * @returns {Promise<Object|void>}
   */
  chat: async (request, onChunk) => {
    if (request.stream) {
      const baseURL = api.defaults.baseURL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseURL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onChunk(data);
              } catch (e) {
                console.error('Failed to parse chunk:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      const response = await api.post('/ai/chat', request);
      return response.data;
    }
  },

  /**
   * Create WebSocket connection for real-time chat
   * ✅ WORKING - No token in URL, correct endpoint
   * @returns {WebSocket}
   */
  createChatWebSocket: () => {
    const token = localStorage.getItem('access_token');
    
    // ✅ CRITICAL: Correct WebSocket URL - NO /api/v1 prefix
    const wsUrl = 'ws://localhost:8000/ws/ai/chat';
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      
      // Send authentication immediately
      if (token) {
        const authMessage = {
          type: 'auth',
          token: token
        };
        ws.send(JSON.stringify(authMessage));
        console.log('📤 Auth message sent');
      } else {
        console.log('👤 Connecting as guest');
        // Send guest connection message
        ws.send(JSON.stringify({
          type: 'guest',
          message: 'Connecting as guest'
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket disconnected: ${event.code} - ${event.reason || 'No reason'}`);
    };

    return ws;
  },

  /**
   * Send message via WebSocket
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} message - Message text
   * @param {string} conversationId - Conversation ID
   * @param {Object} context - Additional context
   */
  sendWebSocketMessage: (ws, message, conversationId = null, context = {}) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'message',
        message: message,
        conversation_id: conversationId,
        context: {
          ...context,
          timestamp: new Date().toISOString()
        }
      };
      ws.send(JSON.stringify(payload));
      return true;
    }
    console.warn('WebSocket not open. ReadyState:', ws?.readyState);
    return false;
  },

  /**
   * Find destinations based on budget and preferences
   */
  findDestinations: (request) => {
    const payload = {
      budget_amount: Number(request.budget_amount),
      currency: request.currency,
      country: request.country || null,
      city: request.city || null,
      travel_interests: request.travel_interests || [],
      trip_duration_days: request.trip_duration_days || 7,
      trip_type: request.trip_type || 'tourism'
    };
    return api.post('/ai/find-destination', payload);
  },

  /**
   * Plan a trip with AI
   */
  planTrip: (request) => {
    const formatDate = (date) => {
      if (!date) return new Date().toISOString().split('T')[0];
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
      return new Date(date).toISOString().split('T')[0];
    };

    const payload = {
      destination: request.destination,
      trip_type: request.trip_type,
      start_date: formatDate(request.start_date),
      end_date: formatDate(request.end_date),
      travel_interests: request.travel_interests,
      budget_type: request.budget_type,
      specific_requirements: request.specific_requirements || '',
      group_size: request.group_size || 1,
      accommodation_preference: request.accommodation_preference || '',
      transportation_preference: request.transportation_preference || ''
    };
    
    return api.post('/ai/plan-trip', payload);
  },

  /**
   * Check if prompt passes guardrails
   */
  checkGuardrails: (prompt) => {
    return api.post('/ai/check-guardrails', { prompt });
  },

  /**
   * Get AI usage statistics
   */
  getUsageStats: (days = 30) => {
    return api.get('/ai/usage-stats', { params: { days } });
  },

  /**
   * Get user's conversation history
   */
  getConversations: (activeOnly = true, page = 1, pageSize = 20) => {
    return api.get('/ai/conversations', {
      params: { 
        active_only: activeOnly, 
        page, 
        page_size: pageSize 
      }
    });
  },

  /**
   * Get messages from a conversation
   */
  getConversationMessages: (conversationId, limit = 50) => {
    return api.get(`/ai/conversations/${conversationId}/messages`, { 
      params: { limit } 
    });
  },

  /**
   * Delete a conversation
   */
  deleteConversation: (conversationId) => {
    return api.delete(`/ai/conversations/${conversationId}`);
  },

  /**
   * Generate trip itinerary for existing trip
   */
  generateTripItinerary: (tripId) => {
    return api.post(`/trips/${tripId}/regenerate-itinerary`);
  },

  /**
   * Export itinerary as PDF
   */
  exportItineraryPDF: (tripId, options = { format: 'pdf' }) => {
    return api.post(`/trips/${tripId}/export`, options, {
      responseType: 'blob'
    });
  }
};

// Export individual methods for direct imports
export const {
  chat,
  createChatWebSocket,
  sendWebSocketMessage,
  findDestinations,
  planTrip,
  checkGuardrails,
  getUsageStats,
  getConversations,
  getConversationMessages,
  deleteConversation,
  generateTripItinerary,
  exportItineraryPDF
} = aiAPI;

export default aiAPI;