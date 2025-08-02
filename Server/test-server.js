const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Restore chat endpoint
app.post('/restore-chat', (req, res) => {
    console.log('🔄 Restore chat request received:', req.body);
    
    res.json({
        success: true,
        canRestore: true,
        message: 'Chat restored successfully (test)'
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
});
