// Simple Socket.IO test script
const { io } = require('socket.io-client');

console.log('🧪 Testing Socket.IO connection...');

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

socket.on('connect', () => {
  console.log('✅ Connected to server with ID:', socket.id);
  
  // Test joining with a user ID
  const testUserId = 'test-user-123';
  console.log('🔗 Joining with user ID:', testUserId);
  socket.emit('join', testUserId);
  
  // Test sending a message after 2 seconds
  setTimeout(() => {
    console.log('📤 Sending test message...');
    socket.emit('sendMessage', {
      senderId: testUserId,
      receiverId: 'test-user-456',
      message: 'Hello, this is a test message!',
      messageType: 'text'
    });
  }, 2000);

  // Test typing indicator after 4 seconds
  setTimeout(() => {
    console.log('⌨️ Testing typing indicator...');
    socket.emit('typing', {
      senderId: testUserId,
      receiverId: 'test-user-456',
      isTyping: true
    });

    // Stop typing after 2 seconds
    setTimeout(() => {
      socket.emit('typing', {
        senderId: testUserId,
        receiverId: 'test-user-456',
        isTyping: false
      });
    }, 2000);
  }, 4000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('onlineUsers', (users) => {
  console.log('👥 Online users:', users);
});

socket.on('userOnline', (userId) => {
  console.log('🟢 User came online:', userId);
});

socket.on('userOffline', (userId) => {
  console.log('🔴 User went offline:', userId);
});

socket.on('receiveMessage', (data) => {
  console.log('📨 Received message:', data);
});

socket.on('messageDelivered', (data) => {
  console.log('✅ Message delivered:', data);
  if (data.isTest) {
    console.log('🧪 This was a test message - no database save');
  }
});

socket.on('messageError', (data) => {
  console.error('❌ Message error:', data);
});

socket.on('userTyping', (data) => {
  console.log('⌨️ User typing:', data);
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n🛑 Closing connection...');
  socket.disconnect();
  process.exit(0);
});

console.log('🔄 Script running... Press Ctrl+C to exit');
