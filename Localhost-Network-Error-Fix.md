# Localhost Network Error Fix

## 🐛 **Error Analysis**

### **Errors Occurring:**
```
AxiosError: Network Error
Error: xhr poll error
```

### **Root Cause:**
- Frontend (localhost:3000) cannot connect to backend (localhost:5000)
- Backend server is not running or not accessible
- CORS issues or port conflicts

## ✅ **Fixes Applied**

### **1. Enhanced Axios Configuration**
- 🔧 **Smart URL detection** - Automatically detects localhost vs production
- 🔧 **Better error handling** - Detailed error messages and debugging
- 🔧 **Request/Response interceptors** - Logs all API calls
- 🔧 **Timeout handling** - 10-second timeout for requests

### **2. Socket.IO Error Handling**
- 🔧 **Connection error detection** - Identifies localhost connection issues
- 🔧 **Helpful error messages** - Guides user to start backend server
- 🔧 **Transport fallback** - Tries different connection methods

### **3. Server Connection Check**
- 🔧 **Health check utility** - Tests server connectivity
- 🔧 **Debugging helper** - Provides troubleshooting steps
- 🔧 **Environment detection** - Smart localhost/production handling

## 🚨 **Backend Server Requirements**

### **Your Backend Must Be Running On:**
```
http://localhost:5000
```

### **Required Endpoints:**
- `POST /displayusersProfile` - Get users list
- `GET /follow-status/:userId` - Get follow status
- `GET /health` - Health check (optional)
- Socket.IO server on same port

## 🔧 **Step-by-Step Fix**

### **Step 1: Start Your Backend Server**
```bash
# Navigate to your backend directory
cd path/to/your/backend

# Install dependencies (if not done)
npm install

# Start the server
npm start
# OR
node server.js
# OR
node index.js
```

### **Step 2: Verify Backend is Running**
Open browser and go to:
```
http://localhost:5000
```
You should see your backend response (not an error page).

### **Step 3: Check Backend Console**
Your backend console should show:
```
Server running on port 5000
Socket.IO server started
```

### **Step 4: Start Frontend**
```bash
# In your frontend directory (nextalk)
npm run dev
```

### **Step 5: Check Frontend Console**
You should see:
```
🌐 Axios baseURL: http://localhost:5000
🔍 Checking server connection to: http://localhost:5000
✅ Server is reachable
🔗 Connecting to server: http://localhost:5000
✅ Connected to server with socket ID: ABC123
```

## 🔍 **Debugging Console Output**

### **Working Connection:**
```
🌐 Axios baseURL: http://localhost:5000
🔍 Checking server connection...
✅ Server is reachable
📡 Fetching users...
📤 Axios request: POST /displayusersProfile
✅ Axios response: 200 /displayusersProfile
🔗 Connecting to server: http://localhost:5000
✅ Connected to server with socket ID: ABC123
```

### **Failed Connection:**
```
🌐 Axios baseURL: http://localhost:5000
🔍 Checking server connection...
❌ Server connection failed: Network Error
🚨 Backend server is not running on localhost:5000
💡 Please start your backend server:
   1. Navigate to your backend directory
   2. Run: npm start or node server.js
   3. Make sure it's running on port 5000
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Network Error" in Axios**
**Cause:** Backend server not running
**Solution:**
1. Start your backend server on port 5000
2. Check if port 5000 is available
3. Verify backend is accessible at http://localhost:5000

### **Issue 2: "xhr poll error" in Socket.IO**
**Cause:** Socket.IO server not running
**Solution:**
1. Ensure your backend has Socket.IO configured
2. Check if Socket.IO is running on same port as HTTP server
3. Verify CORS settings in backend

### **Issue 3: CORS Errors**
**Cause:** Backend not allowing frontend origin
**Solution:**
Add to your backend:
```javascript
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
```

### **Issue 4: Port Already in Use**
**Cause:** Another process using port 5000
**Solution:**
```bash
# Kill process on port 5000
npx kill-port 5000

# Or use different port and update frontend config
```

## 📋 **Backend Server Checklist**

### **Required Backend Setup:**
- ✅ **Express server** running on port 5000
- ✅ **Socket.IO** configured and running
- ✅ **CORS** enabled for localhost:3000
- ✅ **Routes** for `/displayusersProfile` and `/follow-status/:userId`
- ✅ **Database connection** working
- ✅ **Authentication** middleware configured

### **Example Backend Structure:**
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// Your routes here
app.post('/displayusersProfile', (req, res) => {
    // Your logic
});

app.get('/follow-status/:userId', (req, res) => {
    // Your logic
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
});
```

## 🧪 **Testing Steps**

### **Test 1: Backend Accessibility**
```bash
# Test if backend is running
curl http://localhost:5000
# Should return backend response, not connection error
```

### **Test 2: API Endpoints**
```bash
# Test user profile endpoint
curl -X POST http://localhost:5000/displayusersProfile \
  -H "Content-Type: application/json" \
  -d "{}"
```

### **Test 3: Frontend Connection**
1. Open browser console (F12)
2. Go to localhost:3000
3. Check for connection logs
4. Should see successful axios and socket connections

## 🎯 **Expected Results**

### **Backend Console:**
```
Server running on port 5000
Socket.IO server started
Database connected
```

### **Frontend Console:**
```
🌐 Axios baseURL: http://localhost:5000
✅ Server is reachable
📡 Fetching users...
✅ Axios response: 200 /displayusersProfile
🔗 Connecting to server: http://localhost:5000
✅ Connected to server with socket ID: ABC123
```

### **Browser Network Tab:**
- ✅ **POST requests** to localhost:5000 should return 200 status
- ✅ **WebSocket connection** to localhost:5000 should be established
- ✅ **No CORS errors** in console

## 💡 **Quick Fix Commands**

```bash
# 1. Kill any process on port 5000
npx kill-port 5000

# 2. Start backend (adjust path as needed)
cd ../backend && npm start

# 3. Start frontend
npm run dev

# 4. Check if both are running
curl http://localhost:5000
curl http://localhost:3000
```

Once your backend server is running properly on port 5000, the network errors should be resolved! 🎉
