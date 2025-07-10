# Deployment Guide for NextTalk Chat Application

## ✅ **Pre-Deployment Checklist**

### **1. Environment Variables**
Create `.env.local` file in your project root:
```bash
# Frontend Environment Variables
NEXT_PUBLIC_SERVER_URL=https://your-backend-url.com
NODE_ENV=production
```

### **2. Backend Environment Variables**
Ensure your backend has these environment variables:
```bash
# Backend Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextalk
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-domain.com
SOCKET_IO_CORS_ORIGIN=https://your-frontend-domain.com
PORT=5000
```

## 🚀 **Deployment Steps**

### **Frontend Deployment (Vercel/Netlify)**

#### **Vercel Deployment:**
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add in Vercel dashboard:
   - `NEXT_PUBLIC_SERVER_URL=https://your-backend-url.com`
3. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**: Click deploy button

#### **Netlify Deployment:**
1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build Command: `npm run build && npm run export`
   - Publish Directory: `out`
3. **Environment Variables**: Add in Netlify dashboard:
   - `NEXT_PUBLIC_SERVER_URL=https://your-backend-url.com`

### **Backend Deployment (Render/Railway/Heroku)**

#### **Render Deployment:**
1. **Create Web Service**: Connect your backend repository
2. **Environment Variables**: Add in Render dashboard:
   - `MONGODB_URI=your-mongodb-connection-string`
   - `JWT_SECRET=your-jwt-secret`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
   - `SOCKET_IO_CORS_ORIGIN=https://your-frontend-domain.com`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

#### **Railway Deployment:**
1. **Connect Repository**: Link your backend repository to Railway
2. **Environment Variables**: Add in Railway dashboard
3. **Auto-deploy**: Railway will automatically deploy on push

## 🔧 **Code Configuration for Deployment**

### **Smart URL Detection (Already Implemented)**
The application automatically detects the environment:

```javascript
// Socket Service (utils/socket.js)
let serverUrl;
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  serverUrl = 'http://localhost:5000';
} else if (process.env.NEXT_PUBLIC_SERVER_URL) {
  serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
} else {
  serverUrl = 'https://nextalk-u0y1.onrender.com'; // Default production URL
}

// Axios Config (utils/axiosConfig.js)
let baseURL;
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    baseURL = 'http://localhost:5000';
} else if (process.env.NEXT_PUBLIC_SERVER_URL) {
    baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
} else {
    baseURL = 'https://nextalk-u0y1.onrender.com';
}
```

### **Socket.IO Configuration (Already Optimized)**
```javascript
// Deployment-ready socket configuration
this.socket = io(serverUrl, {
  transports: ['polling'], // Start with polling for better compatibility
  withCredentials: true,
  forceNew: false,
  timeout: 20000,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

## 🛠️ **Deployment Troubleshooting**

### **Common Issues & Solutions:**

#### **1. CORS Errors**
```javascript
// Backend: Make sure CORS is configured properly
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://your-frontend-domain.com",
  credentials: true
}));
```

#### **2. Socket.IO Connection Issues**
```javascript
// Backend: Configure Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "https://your-frontend-domain.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

#### **3. Environment Variables Not Loading**
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Restart deployment after adding environment variables
- Check deployment platform's environment variable section

#### **4. Build Errors**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

## 📋 **Deployment Verification**

### **Test Checklist:**
- [ ] Frontend loads without errors
- [ ] Backend API endpoints respond
- [ ] Socket.IO connection establishes
- [ ] User authentication works
- [ ] Messages send and receive in real-time
- [ ] Online/offline status updates
- [ ] Typing indicators work
- [ ] Chat history persists
- [ ] Mobile responsiveness works
- [ ] All features work on different devices

### **Console Checks:**
```javascript
// Check these in browser console after deployment:
console.log('Environment:', process.env.NODE_ENV);
console.log('Server URL:', process.env.NEXT_PUBLIC_SERVER_URL);
console.log('Socket Status:', socketService.getConnectionStatus());
```

## 🔒 **Security Considerations**

### **Environment Variables:**
- Never commit `.env` files to repository
- Use strong JWT secrets
- Restrict CORS origins to your domain only
- Use HTTPS for all production URLs

### **Database Security:**
- Use MongoDB Atlas with IP whitelisting
- Create database user with minimal required permissions
- Enable database authentication

## 📱 **Mobile Optimization**

### **PWA Configuration (Optional):**
```javascript
// next.config.js
const withPWA = require('next-pwa');

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
});
```

## 🎯 **Performance Optimization**

### **Build Optimization:**
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};
```

## ✅ **Final Deployment Steps**

1. **Deploy Backend First**: Ensure backend is running and accessible
2. **Update Frontend Environment**: Set `NEXT_PUBLIC_SERVER_URL` to backend URL
3. **Deploy Frontend**: Deploy with correct environment variables
4. **Test All Features**: Verify chat functionality works end-to-end
5. **Monitor Logs**: Check both frontend and backend logs for errors

## 🚨 **Emergency Rollback**

If deployment fails:
1. **Revert Environment Variables**: Use previous working URLs
2. **Rollback Code**: Use previous working commit
3. **Check Logs**: Identify specific error messages
4. **Test Locally**: Ensure everything works in development first

Your chat application is now ready for production deployment! 🎉
