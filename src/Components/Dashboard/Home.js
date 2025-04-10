import { useState, useEffect } from "react";
import { useTheme } from '../ThemeContext';
import axios from '../../axiosConfig';
import "../../styles/Home.css";

export default function Home() {
    const { theme } = useTheme();
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [following, setFollowing] = useState(new Set());
    const [pendingRequests, setPendingRequests] = useState(new Set());
    const [flipped, setFlipped] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load notifications from localStorage on mount
    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        setNotifications(storedNotifications);

        const fetchUsers = async () => {
            try {
                const response = await axios.post('https://nextalk-u0y1.onrender.com/displayusersData', {}, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                if (err.response && err.response.status === 404) {
                    setError('Users endpoint not found on server. Contact support.');
                } else {
                    setError('Failed to load users. Please check your connection or try again later.');
                }
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return { 
                background: '#1e293b', 
                color: '#e2e8f0', 
                cardBg: '#334155', 
                buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
                buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)',
                notificationBg: 'rgba(51, 65, 85, 0.9)',
            };
        }
        return { 
            background: '#f1f5f9', 
            color: '#1e293b', 
            cardBg: '#ffffff', 
            buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
            buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)',
            notificationBg: 'rgba(255, 255, 255, 0.9)',
        };
    };

    const styles = getThemeStyles();

    const addNotification = (type, userName, userAvatar) => {
        const newNotification = {
            id: Date.now(), // Unique ID based on timestamp
            type,
            message: getNotificationMessage(type, userName),
            avatar: userAvatar || 'https://via.placeholder.com/40',
            createdAt: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Limit to 50 notifications
    };

    const getNotificationMessage = (type, userName) => {
        switch (type) {
            case 'new_message': return `${userName} sent you a new message!`;
            case 'followed': return `${userName} followed you!`;
            case 'request_accepted': return `${userName} accepted your follow request!`;
            case 'user_online': return `${userName} is now online!`;
            default: return 'New event occurred!';
        }
    };

    const handleFollow = (userId) => {
        setFollowing(prev => {
            const newFollowing = new Set(prev);
            const user = users.find(u => u._id === userId);
            if (newFollowing.has(userId)) {
                newFollowing.delete(userId);
            } else {
                newFollowing.add(userId);
                addNotification('followed', user.name, user.avatar); // Add notification when followed
            }
            return newFollowing;
        });
    };

    const handleAccept = (userId) => {
        setPendingRequests(prev => {
            const newRequests = new Set(prev);
            newRequests.delete(userId);
            return newRequests;
        });
        const user = users.find(u => u._id === userId);
        setUsers(prev => prev.map(u => 
            u._id === userId ? { ...u, isRequesting: false } : u
        ));
        addNotification('request_accepted', user.name, user.avatar); // Add notification when accepted
    };

    const toggleFlip = (userId) => {
        setFlipped(prev => {
            const newFlipped = new Set(prev);
            if (newFlipped.has(userId)) newFlipped.delete(userId);
            else newFlipped.add(userId);
            return newFlipped;
        });
    };

    // Simulate a new message or user online (for demo purposes)
    const simulateEvent = (type) => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (randomUser) addNotification(type, randomUser.name, randomUser.avatar);
    };

    const followUsers = users.filter(user => !user.isRequesting);
    const requestUsers = users.filter(user => user.isRequesting);

    if (loading) return <div className="loading">Loading data...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home-container" style={{ background: styles.background, color: styles.color }}>
            <h1 className="home-title">Discover the Community</h1>

            {/* Notifications Feed */}
            <section className="notification-section">
                <h2 className="section-title">Notifications</h2>
                <div className="notification-list">
                    {notifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className="notification-card" 
                            style={{ background: styles.notificationBg }}
                        >
                            <img 
                                src={notif.avatar} 
                                alt="User" 
                                className="notif-avatar" 
                            />
                            <div className="notif-content">
                                <span className="notif-message">{notif.message}</span>
                                <span className="notif-time">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Demo buttons to simulate events */}
                <div className="simulate-buttons">
                    <button onClick={() => simulateEvent('new_message')} className="simulate-btn">Simulate Message</button>
                    <button onClick={() => simulateEvent('user_online')} className="simulate-btn">Simulate Online</button>
                </div>
            </section>

            {/* Follow Section */}
            <section className="user-section">
                <h2 className="section-title">People to Follow</h2>
                <div className="user-list">
                    {followUsers.map(user => (
                        <div 
                            key={user._id}
                            className={`user-card ${flipped.has(user._id) ? 'flipped' : ''}`}
                            onClick={() => toggleFlip(user._id)}
                        >
                            <div className="card-front" style={{ background: styles.cardBg }}>
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                                <span className="user-name">{user.name}</span>
                                <button 
                                    className="follow-btn" 
                                    style={{ background: following.has(user._id) ? styles.buttonHover : styles.buttonGradient }}
                                    onClick={(e) => { e.stopPropagation(); handleFollow(user._id); }}
                                >
                                    {following.has(user._id) ? "Following" : "Follow"}
                                </button>
                            </div>
                            <div className="card-back" style={{ background: styles.cardBg }}>
                                <span className="user-bio">{user.bio}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Accept Section */}
            <section className="user-section">
                <h2 className="section-title">Follow Requests</h2>
                <div className="user-list">
                    {requestUsers.map(user => (
                        <div 
                            key={user._id}
                            className={`user-card ${flipped.has(user._id) ? 'flipped' : ''}`}
                            onClick={() => toggleFlip(user._id)}
                        >
                            <div className="card-front" style={{ background: styles.cardBg }}>
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                                <span className="user-name">{user.name}</span>
                                <button 
                                    className="accept-btn" 
                                    style={{ background: styles.buttonGradient }}
                                    onClick={(e) => { e.stopPropagation(); handleAccept(user._id); }}
                                >
                                    Accept
                                </button>
                            </div>
                            <div className="card-back" style={{ background: styles.cardBg }}>
                                <span className="user-bio">{user.bio}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}