import { useState, useEffect } from "react";
import { useTheme } from '../Components/ThemeContext';
import axios from '../axiosConfig';
import "../styles/Home.css";
import predefine from "../../public/Images/predefine.webp";
import DashboardLayout from '../Components/DashboardLayout';
import Image from "next/image";
import Head from 'next/head';
import ModalPortal from "./ModalPortal";

export default function Home() {
    const { theme } = useTheme();
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [following, setFollowing] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionUser, setSessionUser] = useState(null); // 👈 NEW
    const [selectedUser, setSelectedUser] = useState(null); // 👈 MODAL only


    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        const sessionId = storedUser?.user?.id;

        console.log('👉 Session ID:', sessionId); // 🧪 DEBUG 1

        const fetchUsers = async () => {
            try {
                const response = await axios.post(
                    'https://nextalk-u0y1.onrender.com/displayusersProfile',
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    }
                );

                const all = response.data;
                console.log('👉 All users from backend:', all); // 🧪 DEBUG 2

                // ❗ Fixing the ID comparison properly
                const filtered = all.filter(user => user._id !== sessionId);
                const sessionUser = all.find(user => user._id === sessionId);

                setSessionUser(sessionUser); // 👈 just image display
                setUsers(filtered); // users excluding session user
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching users:', err);
                setError('Failed to load users.');
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
    useEffect(() => {
        if (selectedUser) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
    }, [selectedUser]);
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
                            {/* 🔥 Always show session user image */}
                            {sessionUser && (
                                <div key={sessionUser._id} className="image-card session-user">
                                    <div className="image-wrapper" onClick={() => setSelectedUser(sessionUser)}>
                                        <img
                                            src={sessionUser.image || predefine}
                                            alt={sessionUser.name}
                                            className="image-item"
                                        /><br />
                                        <span className="session-badge">You</span>
                                        <div className="tooltip">
                                            <span></span>
                                            <span>{sessionUser.bio || "No bio available"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 🔁 Render other users */}
                            {users.map(user => (
                                <div key={user._id} className="image-card">
                                    <div className="image-wrapper" onClick={() => setSelectedUser(user)}>
                                        <img
                                            src={user.image || predefine}
                                            alt={user.name}
                                            className="image-item"
                                        />
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
                            {/*suggestedUsers.map(user => (
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
                                        </span><br />
                                        <button
                                            className="btn btn-outline-primary w-50 btn-sm"
                                            style={{ background: following.has(user._id) }}
                                            onClick={() => handleFollow(user._id)}
                                        >
                                            {following.has(user._id) ? "Following" : "Follow"}
                                        </button>
                                    </div>
                                </div>
                            ))*/}
                        </div>
                    </section>
                </div>

                {/* Modal for Profile Preview */}
                <ModalPortal>
                    {selectedUser && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="modal-close" ><i onClick={closeModal} class="bi bi-x-lg"></i></button>
                                <div className="modal-body">
                                    {selectedUser.image ? (
                                        <img src={selectedUser.image} alt={selectedUser.name} className={`modal-image ${selectedUser.isSessionUser ? 'session-user' : ''}`} />
                                    ) : (
                                        <Image src={predefine} alt={selectedUser.name} className={`modal-image ${selectedUser.isSessionUser ? 'session-user' : ''}`} />
                                    )}
                                    <h3>{selectedUser.name}</h3>
                                    <p>{selectedUser.bio || "No bio available"}</p>
                                    <button
                                        className="btn btn-outline-primary w-50 btn-sm"
                                        style={{ background: following.has(selectedUser._id) }}
                                        onClick={() => handleFollow(selectedUser._id)}
                                    >
                                        {following.has(selectedUser._id) ? "Following" : "Follow"}
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}
                </ModalPortal>
            </div>
        </DashboardLayout>
    );
}