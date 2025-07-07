# Socket.IO Debug Guide - Issues Fixed

## 🐛 **Issues Found & Fixed**

### **1. Model Reference Error**
- ❌ **Problem**: Chat model referenced `'User'` instead of `'Users'`
- ✅ **Fixed**: Updated to `ref: 'Users'` in Chat.js

### **2. Missing Error Handling**
- ❌ **Problem**: No proper error handling in Socket.IO events
- ✅ **Fixed**: Added comprehensive error handling and logging

### **3. Connection Issues**
- ❌ **Problem**: CORS and connection configuration issues
- ✅ **Fixed**: Updated CORS settings and connection parameters

### **4. Debugging Lack**
- ❌ **Problem**: No console logs to track message flow
- ✅ **Fixed**: Added detailed logging throughout the system

## 🔧 **Files Modified**

### **Server Side**
1. **Server/Models/Chat.js**
   - Fixed model references from 'User' to 'Users'

2. **Server/backend.js**
   - Added comprehensive logging
   - Improved error handling
   - Updated CORS configuration
   - Enhanced Socket.IO setup

### **Client Side**
1. **utils/socket.js**
   - Added connection debugging
   - Improved error handling
   - Enhanced connection parameters

2. **pages/Dashboard/Messages.js**
   - Added message sending/receiving logs
   - Enhanced debugging information

## 🧪 **Testing Steps**

### **Step 1: Test Socket.IO Connection**
```bash
# In the nextalk directory
node test-socket.js
```
**Expected Output:**
```
🧪 Testing Socket.IO connection...
✅ Connected to server with ID: [socket-id]
🔗 Joining with user ID: test-user-123
👥 Online users: ['test-user-123']
📤 Sending test message...
✅ Message delivered: [message-data]
```

### **Step 2: Start Server with Debugging**
```bash
cd Server
npm start
```
**Watch for:**
- `🚀 Socket.IO server initialized`
- `🔗 New user connected with socket ID: [id]`
- `✅ User [userId] joined successfully`

### **Step 3: Start Client**
```bash
npm run dev
```

### **Step 4: Test Real-Time Chat**
1. Open two browser tabs
2. Login as different users
3. Start a chat
4. **Check Browser Console for:**
   - `✅ Connected to server with socket ID: [id]`
   - `🔗 Joining with user ID: [userId]`
   - `📤 Sending message: [data]`
   - `📨 Received message: [data]`

## 🔍 **Debugging Checklist**

### **Server Console Should Show:**
- ✅ `🚀 Socket.IO server initialized`
- ✅ `🔗 New user connected with socket ID: [id]`
- ✅ `✅ User [userId] joined successfully. Online users: [count]`
- ✅ `📨 Received sendMessage event: [data]`
- ✅ `💾 Adding message to chat...`
- ✅ `✅ Message saved with ID: [messageId]`
- ✅ `📤 Sending message to receiver: [receiverId]`

### **Client Console Should Show:**
- ✅ `🔗 Connecting to server: http://localhost:5000`
- ✅ `✅ Connected to server with socket ID: [id]`
- ✅ `🔗 Joining with user ID: [userId]`
- ✅ `📤 Socket send result: true`
- ✅ `📨 Received message: [data]`

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Socket not connected"**
**Solution:**
- Check if server is running on port 5000
- Verify CORS settings
- Check browser network tab for WebSocket connections

### **Issue 2: "Messages not sending"**
**Solution:**
- Check console for `📤 Sending message:` log
- Verify sessionUserId and selectedChat are set
- Check server logs for `📨 Received sendMessage event:`

### **Issue 3: "Messages not receiving"**
**Solution:**
- Check if both users are online
- Verify receiver's socket connection
- Check for `📨 Received message:` in receiver's console

### **Issue 4: "Database errors"**
**Solution:**
- Ensure MongoDB is running
- Check Chat model is properly imported
- Verify Users collection exists

## 🔄 **Quick Fix Commands**

### **Restart Everything:**
```bash
# Terminal 1 - Server
cd Server
npm start

# Terminal 2 - Client  
npm run dev

# Terminal 3 - Test Socket
node test-socket.js
```

### **Check Dependencies:**
```bash
# Server
cd Server
npm list socket.io

# Client
npm list socket.io-client
```

### **MongoDB Check:**
```bash
# Connect to MongoDB and check collections
mongosh
use nextalk
show collections
db.users.find().limit(2)
db.chats.find().limit(2)
```

## ✅ **Success Indicators**

When everything is working correctly, you should see:

1. **Server starts** with Socket.IO initialization message
2. **Client connects** with successful connection logs
3. **Users join** with online status updates
4. **Messages send** with delivery confirmations
5. **Messages receive** in real-time
6. **Online status** updates with green/red dots

## 📞 **Emergency Debug Mode**

If still having issues, enable maximum debugging:

1. **Add to Server/backend.js:**
```javascript
io.engine.on("connection_error", (err) => {
  console.log("❌ Connection Error:", err.req, err.code, err.message, err.context);
});
```

2. **Add to utils/socket.js:**
```javascript
this.socket.onAny((event, ...args) => {
  console.log('🔄 Socket Event:', event, args);
});
```

The system should now work correctly with proper real-time messaging! 🎉
