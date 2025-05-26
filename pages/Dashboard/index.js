import { useState, useEffect } from "react";
import { useTheme } from '../Components/ThemeContext';
import axios from '../axiosConfig';
import "../styles/Home.css";
import predefine from "../../public/Images/predefine.webp";
import DashboardLayout from '../Components/DashboardLayout';
import Image from "next/image";
import Head from 'next/head';

export default function Home() {
    const { theme } = useTheme();
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [following, setFollowing] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem('user') || '[]');
        setNotifications(storedNotifications);

        const fetchUsers = async () => {
            try {
                const response = await axios.post('https://nextalk-u0y1.onrender.com/displayusersProfile', {}, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });
                const sortedUsers = response.data.sort((a, b) => (a.isSessionUser ? -1 : b.isSessionUser ? 1 : 0));
                setUsers(sortedUsers);
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

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

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

    const addNotification = (type, userName, userAvatar) => {
        const newNotification = {
            id: Date.now(),
            type,
            message: getNotificationMessage(type, userName),
            avatar: predefine,
            createdAt: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
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
                addNotification('followed', user.name, user.avatar);
            }
            return newFollowing;
        });
    };

    const handleFollowAll = () => {
        const newFollowing = new Set(following);
        suggestedUsers.forEach(user => {
            if (!newFollowing.has(user._id)) {
                newFollowing.add(user._id);
                addNotification('followed', user.name, user.avatar);
            }
        });
        setFollowing(newFollowing);
    };

    const openModal = (user) => {
        setSelectedUser(user);
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    const allUsers = users.filter(user => !user.isRequesting);
    const sessionUser = allUsers.find(user => user.isSessionUser);
    const suggestedUsers = allUsers.filter(user => !user.isSessionUser);

    //if (loading) return <div className="loading" aria-label="Loading">Loading Data</div>;
    //if (error) return <div className="error">{error}</div>;

    return (
        <DashboardLayout>
            <Head>
                <title>Welcome to NexTalk</title>
            </Head>
            <div className="home-container" style={{ background: styles.background, color: styles.color }}>
                <div className="home-content">
                    {/* Horizontal Scrollable Image Section */}
                    <section className="image-section">
                        <div className="image-list" aria-label="User profile images">
                            {allUsers.map(user => (
                                <div key={user._id} className={`image-card ${user.isSessionUser ? 'session-user' : ''}`}>
                                    <div className="image-wrapper" onClick={() => openModal(user)}>
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="image-item" />
                                        ) : (
                                            <Image src={predefine} alt={user.name} className="image-item" />
                                        )}
                                        {user.isSessionUser && <span className="session-badge">You</span>}
                                        <div className="tooltip">
                                            <span>{user.name}</span>
                                            <span>{user.bio || "No bio available"}</span>
                                        </div>
                                    </div>
                                    <span className="image-username">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Suggested for you Section */}
                    <section className="suggested-section animate-fade-in">
                        <div className="suggested-header">
                            <h2 className="section-title">Suggested for You</h2>
                            <a href="#" className="see-all">See All</a>
                        </div>
                        <button className="follow-all-btn" onClick={handleFollowAll}>
                            Follow All
                        </button>
                        <div className="suggested-grid">
                            {suggestedUsers.map(user => (
                                <div key={user._id} className="suggested-card">
                                    <div className="suggested-image-wrapper">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="suggested-image" />
                                        ) : (
                                            <Image src={predefine} alt={user.name} className="suggested-image" />
                                        )}
                                    </div>
                                    <div className="suggested-info">
                                        <span className="suggested-name">{user.name}</span>
                                        <span className="suggested-followed-by">
                                            Followed by {user.followedBy || "user1, user2"} + {user.followedByCount || 3} more
                                        </span><br/>
                                        <button
                                            className="btn btn-outline-primary w-50 btn-sm"
                                            style={{ background: following.has(user._id)}}
                                            onClick={() => handleFollow(user._id)}
                                        >
                                            {following.has(user._id) ? "Following" : "Follow"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Modal for Profile Preview */}
                {selectedUser && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeModal}>×</button>
                            <div className="modal-body">
                                {selectedUser.image ? (
                                    <img src={selectedUser.image} alt={selectedUser.name} className={`modal-image ${selectedUser.isSessionUser ? 'session-user' : ''}`} />
                                ) : (
                                    <Image src={predefine} alt={selectedUser.name} className={`modal-image ${selectedUser.isSessionUser ? 'session-user' : ''}`} />
                                )}
                                <h3>{selectedUser.name}</h3>
                                <p>{selectedUser.bio || "No bio available"}</p>
                                <button
                                    className="follow-btn"
                                    style={{ background: following.has(selectedUser._id) ? styles.buttonHover : styles.buttonGradient }}
                                    onClick={() => handleFollow(selectedUser._id)}
                                >
                                    {following.has(selectedUser._id) ? "Following" : "Follow"}
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}