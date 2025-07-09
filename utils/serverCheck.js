// Server connectivity check utility
export const checkServerConnection = async (serverUrl) => {
    try {
        console.log('🔍 Checking server connection to:', serverUrl);
        
        const response = await fetch(serverUrl + '/health', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            console.log('✅ Server is reachable');
            return true;
        } else {
            console.warn('⚠️ Server responded with status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Server connection failed:', error.message);
        
        if (serverUrl.includes('localhost')) {
            console.error('🚨 Backend server is not running on localhost:5000');
            console.error('💡 Please start your backend server:');
            console.error('   1. Navigate to your backend directory');
            console.error('   2. Run: npm start or node server.js');
            console.error('   3. Make sure it\'s running on port 5000');
        }
        
        return false;
    }
};

export const getServerUrl = () => {
    // Check if we're on localhost (client-side)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
    } else if (process.env.NEXT_PUBLIC_SERVER_URL) {
        return process.env.NEXT_PUBLIC_SERVER_URL;
    } else if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    } else {
        // Default to production server
        return 'https://nextalk-u0y1.onrender.com';
    }
};

export const debugServerConnection = async () => {
    const serverUrl = getServerUrl();
    console.log('🌐 Current environment:', process.env.NODE_ENV);
    console.log('🏠 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server');
    console.log('🔗 Server URL:', serverUrl);
    
    const isConnected = await checkServerConnection(serverUrl);
    
    if (!isConnected && serverUrl.includes('localhost')) {
        console.log('📋 Localhost troubleshooting checklist:');
        console.log('   ✓ Is your backend server running?');
        console.log('   ✓ Is it running on port 5000?');
        console.log('   ✓ Can you access http://localhost:5000 in browser?');
        console.log('   ✓ Are there any CORS issues?');
        console.log('   ✓ Check backend console for errors');
    }
    
    return isConnected;
};
