import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.messageCallbacks = [];
    this.onlineStatusCallbacks = [];
    this.typingCallbacks = [];
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return;
    }

    this.userId = userId;

    // Connect to the server - Smart URL detection
    let serverUrl;

    // Check if we're on localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      serverUrl = 'http://localhost:5000';
    } else if (process.env.NEXT_PUBLIC_SERVER_URL) {
      serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    } else {
      // Default to production server
      serverUrl = 'https://nextalk-u0y1.onrender.com';
    }

    console.log('🔗 Connecting to server:', serverUrl);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🏠 Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server');

    try {
      this.socket = io(serverUrl, {
        transports: ['polling'], // Start with polling only to avoid WebSocket errors
        withCredentials: true,
        forceNew: false,
        timeout: 20000,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    } catch (error) {
      console.error('❌ Socket connection error:', error);
      // Fallback to basic connection
      this.socket = io(serverUrl);
    }

    this.socket.on('connect', () => {
      console.log('✅ Connected to server with socket ID:', this.socket.id);
      this.isConnected = true;

      // Join with user ID and update online status in database
      if (this.userId) {
        console.log('🔗 Joining with user ID:', this.userId);
        this.socket.emit('join', this.userId);

        // Update user's online status in database
        this.socket.emit('updateOnlineStatus', {
          userId: this.userId,
          isOnline: true,
          lastSeen: new Date().toISOString()
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      console.error('🚨 Failed to connect to:', serverUrl);

      // Check if it's a localhost connection issue
      if (serverUrl.includes('localhost')) {
        console.error('🔧 Make sure your backend server is running on http://localhost:5000');
        console.error('💡 Try running: npm start or node server.js in your backend directory');
      }

      // Try to reconnect with different transport
      if (error.message.includes('websocket')) {
        console.log('🔄 Retrying with polling transport...');
        this.socket.io.opts.transports = ['polling'];
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Disconnected from server');
      this.isConnected = false;

      // Update user's offline status in database before disconnect
      if (this.userId) {
        this.socket.emit('updateOnlineStatus', {
          userId: this.userId,
          isOnline: false,
          lastSeen: new Date().toISOString()
        });
      }
    });

    // Handle incoming messages
    this.socket.on('receiveMessage', (data) => {
      console.log('📨 Socket received message:', data);
      this.messageCallbacks.forEach(callback => {
        console.log('🔄 Calling message callback');
        callback(data);
      });
    });

    // Handle message delivery confirmation
    this.socket.on('messageDelivered', (data) => {
      console.log('✅ Message delivered confirmation:', data);
    });

    // Handle message errors
    this.socket.on('messageError', (data) => {
      console.error('Message error:', data);
    });

    // Handle online users list
    this.socket.on('onlineUsers', (userIds) => {
      this.onlineStatusCallbacks.forEach(callback => 
        callback({ type: 'initial', userIds })
      );
    });

    // Handle user coming online
    this.socket.on('userOnline', (userId) => {
      this.onlineStatusCallbacks.forEach(callback => 
        callback({ type: 'online', userId })
      );
    });

    // Handle user going offline
    this.socket.on('userOffline', (userId) => {
      this.onlineStatusCallbacks.forEach(callback => 
        callback({ type: 'offline', userId })
      );
    });

    // Handle typing indicators
    this.socket.on('userTyping', (data) => {
      this.typingCallbacks.forEach(callback => callback(data));
    });

    // Handle message read status
    this.socket.on('messageRead', (data) => {
      console.log('Message read:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  sendMessage(receiverId, message, messageType = 'text') {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return false;
    }

    if (!this.userId || !receiverId || !message) {
      console.error('❌ Missing required data:', { userId: this.userId, receiverId, message });
      return false;
    }

    const messageData = {
      senderId: this.userId,
      receiverId,
      message,
      messageType,
      timestamp: new Date().toISOString(),
      delivered: false,
      read: false
    };

    console.log('📤 Sending message to database:', messageData);
    this.socket.emit('sendMessage', messageData);

    return true;
  }

  // Load message history from database
  loadMessageHistory(userId, callback) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return false;
    }

    console.log('📚 Loading message history for user:', userId);
    this.socket.emit('loadMessageHistory', {
      userId: this.userId,
      chatPartnerId: userId
    });

    // Listen for message history response
    this.socket.once('messageHistory', callback);
    return true;
  }

  // Get user's real-time online status from database
  getUserOnlineStatus(userIds, callback) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return false;
    }

    console.log('👥 Getting online status for users:', userIds);
    this.socket.emit('getUserOnlineStatus', { userIds });

    // Listen for online status response
    this.socket.once('userOnlineStatusResponse', callback);
    return true;
  }

  // Update user's online status manually
  updateUserOnlineStatus(userId, isOnline) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot update online status');
      return false;
    }

    if (!this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot update online status');
      return false;
    }

    if (!userId) {
      console.warn('⚠️ No userId provided for online status update');
      return false;
    }

    try {
      console.log(`${isOnline ? '🟢' : '🔴'} Updating online status for user ${userId}:`, isOnline);

      this.socket.emit('updateOnlineStatus', {
        userId: userId,
        isOnline: isOnline,
        lastSeen: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('❌ Error updating online status:', error);
      return false;
    }
  }

  sendTypingIndicator(receiverId, isTyping) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('typing', {
      senderId: this.userId,
      receiverId,
      isTyping
    });
  }

  markAsRead(chatId, messageId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('markAsRead', {
      chatId,
      messageId,
      userId: this.userId
    });
  }

  // Callback management
  onMessage(callback) {
    this.messageCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onOnlineStatus(callback) {
    this.onlineStatusCallbacks.push(callback);
    
    return () => {
      this.onlineStatusCallbacks = this.onlineStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback) {
    this.typingCallbacks.push(callback);
    
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
