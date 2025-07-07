import { useState, useRef, useEffect, useCallback } from "react";
import axios from '../../utils/axiosConfig';
import Image from "next/image";
import predefine from "../../public/Images/predefine.webp";
import DashboardLayout from '../Components/DashboardLayout';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import socketService from '../../utils/socket';

export default function Messages() {
    const [users, setUsers] = useState([]);
    const [sessionUser, setSessionUser] = useState(null);
    const [following, setFollowing] = useState(new Set());
    const [accepted, setAccepted] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayCount, setDisplayCount] = useState(6);
    const [visibleUsers, setVisibleUsers] = useState([]);
    const [filteredFollowers, setFilteredFollowers] = useState([]);
    const [profile, setProfile] = useState({
        username: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'No bio yet.',
        avatar: predefine,
        posts: 15,
        followersCount: 250,
        followingCount: 180,
    });
    const { theme } = useTheme();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const router = useRouter();

    // Mock last message data and reactions
    const [lastMessages, setLastMessages] = useState({});
    const [reactions, setReactions] = useState({});
    const [messages, setMessages] = useState([
        { id: 1, sender: "You", text: "Hey, how's it going?", timestamp: "10:30 AM" },
        { id: 2, sender: "Friend", text: "Pretty good, thanks! You?", timestamp: "10:32 AM" },
        { id: 3, sender: "You", text: "Hey, how's it going?", timestamp: "10:42 AM" },
        { id: 4, sender: "Friend", text: "Pretty good, thanks! You?", timestamp: "10:52 AM" },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [sessionUserId, setSessionUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatMessages, setChatMessages] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Local Storage utility functions
    const getChatHistory = (userId) => {
        try {
            if (!sessionUserId || !userId) return [];
            const chatKey = `chat_${sessionUserId}_${userId}`;
            const stored = localStorage.getItem(chatKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    };

    // Handle back to chat list on mobile
    const handleBackToList = () => {
        setSelectedChat(null);
        setSelectedUser(null);
        router.replace('/Dashboard/Messages', undefined, { shallow: true });
    };

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = JSON.parse(sessionStorage.getItem('user'));
            const sessionId = storedUser?.user?.id;

            if (!sessionId) {
                setError('No session found.');
                setLoading(false);
                return;
            }

            try {
                // Fetch all users
                const response = await axios.post(
                    'https://nextalk-u0y1.onrender.com/displayusersProfile',
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    }
                );

                const personally = response.data;
                const filteredUsers = personally.filter(user => user._id !== sessionId);
                const sessionUser = personally.find(user => user._id === sessionId);
                setSessionUser(sessionUser);

                // Fetch follow status
                const followRes = await fetch(`https://nextalk-u0y1.onrender.com/follow-status/${sessionId}`);
                const followData = await followRes.json();
                setFollowing(new Set(followData.following));
                setAccepted(new Set(followData.accepted));

                // Mock last messages and reactions
                const mockLastMessages = filteredUsers.reduce((acc, user) => ({
                    ...acc,
                    [user._id]: user.lastMessage || `Hey, what's up? ${new Date().toLocaleTimeString()}`,
                }), {});
                const mockReactions = filteredUsers.reduce((acc, user) => ({
                    ...acc,
                    [user._id]: user.reaction || (Math.random() > 0.5 ? '❤️' : null),
                }), {});
                setLastMessages(mockLastMessages);
                setReactions(mockReactions);

                setUsers(filteredUsers);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching data:', err);
                setError('Failed to load data.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Socket.IO connection and real-time functionality
    useEffect(() => {
        if (sessionUserId) {
            // Connect to Socket.IO
            socketService.connect(sessionUserId);

            // Listen for incoming messages
            const unsubscribeMessages = socketService.onMessage((data) => {
                console.log('📨 Received message:', data);
                const { senderId, receiverId, message, timestamp, messageId } = data;

                // Add message to chat if it's for current user or current chat
                if (receiverId === sessionUserId || senderId === sessionUserId) {
                    console.log('✅ Message is for current user, adding to chat');
                    const chatPartnerId = receiverId === sessionUserId ? senderId : receiverId;

                    const newMessage = {
                        id: messageId,
                        sender: senderId === sessionUserId ? "You" : "Friend",
                        text: message,
                        timestamp: new Date(timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })
                    };

                    setChatMessages(prev => ({
                        ...prev,
                        [chatPartnerId]: [...(prev[chatPartnerId] || []), newMessage]
                    }));

                    // Update last messages
                    setLastMessages(prev => ({
                        ...prev,
                        [chatPartnerId]: message.length > 30 ? message.substring(0, 30) + '...' : message
                    }));
                }
            });

            // Listen for online status updates
            const unsubscribeOnlineStatus = socketService.onOnlineStatus((data) => {
                console.log('👥 Online status update:', data);
                if (data.type === 'initial') {
                    console.log('📋 Setting initial online users:', data.userIds);
                    setOnlineUsers(new Set(data.userIds));
                } else if (data.type === 'online') {
                    console.log('🟢 User came online:', data.userId);
                    setOnlineUsers(prev => new Set([...prev, data.userId]));
                } else if (data.type === 'offline') {
                    console.log('🔴 User went offline:', data.userId);
                    setOnlineUsers(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(data.userId);
                        return newSet;
                    });
                }
            });

            // Listen for typing indicators
            const unsubscribeTyping = socketService.onTyping((data) => {
                console.log('⌨️ Typing indicator:', data);
                const { userId, isTyping } = data;
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    if (isTyping) {
                        console.log('⌨️ User started typing:', userId);
                        newSet.add(userId);
                    } else {
                        console.log('⌨️ User stopped typing:', userId);
                        newSet.delete(userId);
                    }
                    return newSet;
                });

                // Clear typing indicator after 3 seconds
                if (isTyping) {
                    setTimeout(() => {
                        setTypingUsers(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(userId);
                            return newSet;
                        });
                    }, 3000);
                }
            });

            // Cleanup on unmount
            return () => {
                unsubscribeMessages();
                unsubscribeOnlineStatus();
                unsubscribeTyping();
                socketService.disconnect();
            };
        }
    }, [sessionUserId]);

    // Handle direct URL access
    useEffect(() => {
        if (router.isReady && users.length > 0 && !selectedChat && sessionUserId) {
            const { userId } = router.query;
            if (userId && userId !== 'undefined' && userId !== 'null') {
                const userToSelect = users.find(u => u._id === userId);
                if (userToSelect && accepted.has(userToSelect._id)) {
                    setSelectedChat(userToSelect._id);
                    setSelectedUser(userToSelect);
                    // Load chat history for this user
                    const history = getChatHistory(userToSelect._id);
                    setChatMessages(prev => ({
                        ...prev,
                        [userToSelect._id]: history
                    }));
                }
            }
        }
    }, [router.isReady, users, accepted, selectedChat, sessionUserId]);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, selectedChat]);

    useEffect(() => {
        const fetchUsers = async () => {
            const storedUser = JSON.parse(sessionStorage.getItem("user"));
            const sessionId = storedUser?.user?.id;
            setSessionUserId(sessionId);

            try {
                const response = await axios.post(
                    "https://nextalk-u0y1.onrender.com/displayusersProfile",
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                    }
                );

                const allUsers = response.data.filter(user => user._id !== sessionId);
                setUsers(allUsers);
                setVisibleUsers(allUsers.slice(0, 6)); // first 6
                setTimeout(() => setLoading(false), 1000); // optional fake delay
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search query and online status
    const filteredUsers = users
        .filter(user => accepted.has(user._id))
        .filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(user =>
            showOnlineOnly ? user.isOnline : true
        );

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#e2e8f0',
                cardBg: 'rgba(255, 255, 255, 0.1)',
                buttonGradient: 'linear-gradient(45deg, #ff6f61, #ffcc00)',
                buttonHover: 'linear-gradient(45deg, #ff4b3a, #ffb800)',
                notificationBg: 'rgba(51, 65, 85, 0.9)',
            };
        }
        return {
            background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(244, 244, 244) 100%)',
            color: '#1e293b',
            cardBg: 'rgba(255, 255, 255, 0.8)',
            buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
            buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)',
        };
    };

    const styles = getThemeStyles();

    const getThemeStyless = () => {
        if (theme === 'dark') {
            return {
                background: '#1e293b',
                color: '#e2e8f0',
                inputBg: '#334155',
                inputColor: '#e2e8f0',
                messageBgYou: '#3b82f6',
                messageBgFriend: '#4b5563'
            };
        }
        // Default to light styles for 'homeback' or any other theme
        return {
            background: '#ffffff',
            color: '#1e293b',
            inputBg: '#f1f5f9',
            inputColor: '#1e293b',
            messageBgYou: '#3b82f6',
            messageBgFriend: '#e5e7eb'
        };
    };

    const currentThemeStyles = getThemeStyless();

    const handleSendMessage = (e) => {
        e.preventDefault();
        console.log('🚀 Attempting to send message:', {
            newMessage: newMessage.trim(),
            selectedChat,
            sessionUserId,
            socketConnected: socketService.getConnectionStatus()
        });

        if (newMessage.trim() && selectedChat && sessionUserId) {
            // Send message via Socket.IO for real-time delivery
            const success = socketService.sendMessage(selectedChat, newMessage.trim());
            console.log('📤 Socket send result:', success);

            if (success) {
                // Add message to local state immediately for instant UI update
                const newMsg = {
                    id: Date.now(),
                    sender: "You",
                    text: newMessage.trim(),
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                };

                const currentMessages = chatMessages[selectedChat] || [];
                const updatedMessages = [...currentMessages, newMsg];

                // Update chat messages state
                setChatMessages(prev => ({
                    ...prev,
                    [selectedChat]: updatedMessages
                }));

                // Update last messages for the chat list
                setLastMessages(prev => ({
                    ...prev,
                    [selectedChat]: newMsg.text.length > 30 ? newMsg.text.substring(0, 30) + '...' : newMsg.text
                }));

                // Clear input
                setNewMessage("");

                // Stop typing indicator
                if (isTyping) {
                    setIsTyping(false);
                    socketService.sendTypingIndicator(selectedChat, false);
                }
            } else {
                console.error('Failed to send message - Socket not connected');
            }
        }
    };

    // Handle typing indicator
    const handleTyping = useCallback((value) => {
        setNewMessage(value);

        if (selectedChat && sessionUserId) {
            if (value.trim() && !isTyping) {
                setIsTyping(true);
                socketService.sendTypingIndicator(selectedChat, true);
            } else if (!value.trim() && isTyping) {
                setIsTyping(false);
                socketService.sendTypingIndicator(selectedChat, false);
            }

            // Clear typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing indicator
            typingTimeoutRef.current = setTimeout(() => {
                if (isTyping) {
                    setIsTyping(false);
                    socketService.sendTypingIndicator(selectedChat, false);
                }
            }, 2000);
        }
    }, [selectedChat, sessionUserId, isTyping]);
    
    useEffect(() => {
        if (!profile || !Array.isArray(profile.followers)) return;

        // Extract follower user IDs from the populated followers array
        const followersArray = profile.followers.map(f => f._id?.toString());

        // Filter only users who are followers
        const followedUsers = users.filter(user =>
            followersArray.includes(user._id?.toString())
        );

        // Filter for search
        const filtered = followedUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredFollowers(filtered); // useful for Load More check

        // Control visible users based on search or default count
        if (searchTerm.trim() === '') {
            setVisibleUsers(followedUsers.slice(0, displayCount));
        } else {
            setVisibleUsers(filtered.slice(0, displayCount));
        }

    }, [searchTerm, users, displayCount, profile]);


    const handleLoadMore = () => {
        const prevCount = displayCount;
        const newCount = prevCount + 6;
        setDisplayCount(newCount);

        // Scroll to the previous 6th user (after DOM update)
        setTimeout(() => {
            const userElems = document.querySelectorAll(".user-result");
            if (userElems[prevCount]) {
                userElems[prevCount].scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }, 100); // wait a moment for new DOM elements to render
    };
    return (
        <DashboardLayout>
            {loading ? (
                <div className="custom-loader-overlay">
                    <svg viewBox="0 0 100 100">
                        <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6">
                            {/* left line */}
                            <path d="M 21 40 V 59">
                                <animateTransform attributeName="transform" type="rotate" values="0 21 59; 180 21 59" dur="2s" repeatCount="indefinite" />
                            </path>
                            {/* right line */}
                            <path d="M 79 40 V 59">
                                <animateTransform attributeName="transform" type="rotate" values="0 79 59; -180 79 59" dur="2s" repeatCount="indefinite" />
                            </path>
                            {/* top line */}
                            <path d="M 50 21 V 40">
                                <animate attributeName="d" values="M 50 21 V 40; M 50 59 V 40" dur="2s" repeatCount="indefinite" />
                            </path>
                            {/* bottom line */}
                            <path d="M 50 60 V 79">
                                <animate attributeName="d" values="M 50 60 V 79; M 50 98 V 79" dur="2s" repeatCount="indefinite" />
                            </path>
                            {/* top box */}
                            <path d="M 50 21 L 79 40 L 50 60 L 21 40 Z">
                                <animate attributeName="stroke" values="rgba(255,255,255,1); rgba(100,100,100,0)" dur="2s" repeatCount="indefinite" />
                            </path>
                            {/* mid box */}
                            <path d="M 50 40 L 79 59 L 50 79 L 21 59 Z" />
                            {/* bottom box */}
                            <path d="M 50 59 L 79 78 L 50 98 L 21 78 Z">
                                <animate attributeName="stroke" values="rgba(100,100,100,0); rgba(255,255,255,1)" dur="2s" repeatCount="indefinite" />
                            </path>
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -19" dur="2s" repeatCount="indefinite" />
                        </g>
                    </svg>
                </div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : filteredUsers.length === 0 ? (
                <div className="no-friends">No friends to message.</div>
            ) : (
                <div className="chat-container" style={{ background: styles.background, color: styles.color }}>
                    {/* Left Sidebar for Chat List */}
                    <div className="chat-list">
                        {/* Session User Name - Hidden on mobile */}
                        <h2 className="chat-title d-none d-md-block">
                            {sessionUser?.name || sessionUser?.username || 'User'}
                        </h2>

                        {/* Search Input - Full width with Bootstrap 5 */}
                        <div className="mb-3 px-3">
                            <div className="position-relative">
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-control"
                                    style={{
                                        borderRadius: '25px',
                                        paddingLeft: '20px',
                                        paddingRight: '50px'
                                    }}
                                />
                                <span className="position-absolute" style={{
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6c757d'
                                }}>
                                    <i className="bi bi-search"></i>
                                </span>
                            </div>
                        </div>

                        {/* Messages Label */}
                        <span className="fw-bold text-muted mb-2 d-block px-3">Messages</span>
                        {filteredUsers.map(user => (
                            <div
                                key={user._id}
                                className="chat-item"
                                onClick={() => {
                                    setSelectedChat(user._id);
                                    setSelectedUser(user);
                                    // Update URL with user ID
                                    router.replace(`/Dashboard/Messages?userId=${user._id}`, undefined, { shallow: true });
                                    // Load chat history for this user
                                    const history = getChatHistory(user._id);
                                    setChatMessages(prev => ({
                                        ...prev,
                                        [user._id]: history
                                    }));
                                }}
                            >
                                <div className="avatar-container">
                                    <Image
                                        src={user.image || predefine}
                                        alt={user.name}
                                        width={40}
                                        height={40}
                                        className="avatar"
                                    />
                                    <span
                                        className={`status-indicator ${onlineUsers.has(user._id) ? 'online' : 'offline'}`}
                                        title={onlineUsers.has(user._id) ? 'Online' : 'Offline'}
                                    ></span>
                                </div>
                                <div className="chat-details">
                                    <div className="chat-header">
                                        <span className="user-name">{user.name}</span>
                                        <span className="timestamp">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="last-message">
                                        {typingUsers.has(user._id) ? (
                                            <span className="typing-text">
                                                <span className="typing-indicator">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </span>
                                                typing...
                                            </span>
                                        ) : (
                                            lastMessages[user._id] || 'No messages yet'
                                        )}
                                    </p>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Panel for Chat or Instructions */}
                    <div className={`chat-panel ${selectedChat ? 'chat-panel-active' : ''}`}>
                        {selectedChat ? (
                            <div className="chat-window">
                                {/* Chat Header with Back Button for Mobile */}
                                <div className="chat-header d-flex align-items-center gap-3">
                                    {/* Back Button - Only visible on mobile */}
                                    <button
                                        className="btn btn-link d-md-none p-0"
                                        onClick={handleBackToList}
                                        style={{ fontSize: '1.2rem', color: getThemeStyles().color }}
                                    >
                                        <i className="bi bi-arrow-left"></i>
                                    </button>

                                    <div className="d-flex align-items-center gap-3">
                                        <Image
                                            src={filteredUsers.find(u => u._id === selectedChat)?.image || predefine}
                                            alt={filteredUsers.find(u => u._id === selectedChat)?.name}
                                            width={50}
                                            height={50}
                                            className="avatar"
                                            style={{ borderRadius: '50%' }}
                                        />
                                        <div>
                                            <h3 className="mb-0" style={{ fontSize: '1.2rem' }}>
                                                {filteredUsers.find(u => u._id === selectedChat)?.name}
                                            </h3>
                                            <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Active now</p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className=""
                                    style={{
                                        background: currentThemeStyles.background,
                                        color: currentThemeStyles.color
                                    }}
                                >
                                    {/* Chat Messages Container with Fixed Height and Scrolling */}
                                    <div
                                        className="chat-messages"
                                        style={{
                                            height: 'calc(100vh - 300px)',
                                            overflowY: 'auto',
                                            padding: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        }}
                                    >
                                        {chatMessages[selectedChat] && chatMessages[selectedChat].length > 0 ? (
                                            <>
                                                {chatMessages[selectedChat].map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`message ${msg.sender === "You" ? "message-you" : "message-friend"}`}
                                                    >
                                                        <div
                                                            className="message-bubble"
                                                            style={{
                                                                background: msg.sender === "You"
                                                                    ? currentThemeStyles.messageBgYou || '#3b82f6'
                                                                    : currentThemeStyles.messageBgFriend || (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                                                                color: msg.sender === "You" ? '#ffffff' : currentThemeStyles.color
                                                            }}
                                                        >
                                                            <span className="message-text">{msg.text}</span>
                                                            <span className="message-timestamp">{msg.timestamp}</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Typing Indicator */}
                                                {typingUsers.has(selectedChat) && (
                                                    <div className="message message-friend">
                                                        <div
                                                            className="message-bubble"
                                                            style={{
                                                                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                                color: currentThemeStyles.color
                                                            }}
                                                        >
                                                            <span className="typing-indicator">
                                                                <span></span>
                                                                <span></span>
                                                                <span></span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Auto-scroll anchor */}
                                                <div ref={messagesEndRef} />
                                            </>
                                        ) : (
                                            <div className="text-center p-4" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%'
                                            }}>
                                                <i className="bi bi-chat-dots" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                                                <h4 className="mt-3">No messages yet</h4>
                                                <p className="text-muted">Start the conversation by sending a message!</p>
                                            </div>
                                        )}
                                    </div>
                                    <form className="chat-input-form" onSubmit={handleSendMessage}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="chat-input form-control"
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => handleTyping(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                                style={{
                                                    background: currentThemeStyles.inputBg,
                                                    color: currentThemeStyles.inputColor,
                                                    border: 'none',
                                                    borderRadius: '25px',
                                                    padding: '12px 20px'
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                className="chat-send-btn btn btn-primary"
                                                onClick={handleSendMessage}
                                                style={{
                                                    borderRadius: '50%',
                                                    width: '45px',
                                                    height: '45px',
                                                    marginLeft: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <i className="bi bi-send-fill"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="instructions">
                                <div className="text-center">
                                    <div className="icon-container">
                                        <span className="chat-icon"><i class="bi bi-chat-right-text"></i></span>
                                    </div>
                                    <h3 className="instruction-title">Your messages</h3>
                                    <p className="instruction-text">Send a message to start a chat.</p>
                                    <button className="send-button" style={{ cursor: "pointer" }} data-bs-toggle="modal" data-bs-target="#followers">{profile.followersCount || "0"} Send message</button></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="modal" id="followers">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className='d-flex justify-content-between'>
                            <div>
                                <h5>Followers</h5>
                            </div>
                            <div>
                                <button type="button" className="btn-close bg-primary" data-bs-dismiss="modal"></button>
                            </div>
                        </div><hr />
                        <div className="">
                            <div>
                                <input
                                    type="search"
                                    name="search"
                                    id="search"
                                    className="form-control mb-3"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    style={{
                                        backgroundColor: "white",
                                        transition: "background 0.3s",
                                        gap: "10px",
                                        border: "1px solid #333"
                                    }}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "white"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "whitesmock"}
                                />

                                {
                                    loading ? (
                                        <div className='d-flex gap-4'>
                                            <div
                                                className="skeleton"
                                                style={{
                                                    width: "45px",
                                                    height: "45px",
                                                    borderRadius: "50%",
                                                }}
                                            ></div>
                                            <div>
                                                <div
                                                    className="skeleton"
                                                    style={{
                                                        width: "120px",
                                                        height: "16px",
                                                        borderRadius: "4px",
                                                        marginBottom: "8px",
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {visibleUsers.length > 0 ? (
                                                visibleUsers.map(user => (
                                                    <div key={user._id} className='d-flex align-items-center mb-2 p-2 rounded user-result' style={{ justifyContent: "space-between" }}>
                                                        <div
                                                            className="d-flex gap-4 align-items-center"
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <Image
                                                                src={user.image || predefine}
                                                                alt={user.name}
                                                                width={60}
                                                                height={60}
                                                                className="rounded-circle"
                                                                style={{ objectFit: "cover" }}
                                                            />
                                                            <div>
                                                                <strong>{user.username}</strong><br />
                                                                <span>{user.name}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <button
                                                                className='btn btn-primary btn-sm'
                                                                onClick={() => handleRemoveFollower(user._id)}
                                                            >
                                                                Message
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-followers-container text-center mt-5">
                                                    <div className="icon-wrapper mb-3">
                                                        <i className="bi bi-person-x" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                                                    </div>
                                                    <h5 style={{ color: "#6c757d" }}>No Followers Found</h5>
                                                </div>

                                            )}
                                            {/* Show "Load More" button only if there are more followed users to show */}
                                            {visibleUsers.length < filteredFollowers.length && (
                                                searchTerm.trim() === ''
                                                    ? (profile.followers.length || 0)
                                                    : users.filter(user =>
                                                        profile.followers.includes(user._id) &&
                                                        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    ).length
                                            ) && (
                                                    <div className="text-center mt-3">
                                                        <button className="btn w-100 btn-outline-primary" onClick={handleLoadMore}>
                                                            Load More
                                                        </button>
                                                    </div>
                                                )}


                                        </>


                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}