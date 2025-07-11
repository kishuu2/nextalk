import { useState, useEffect } from "react";
import { useTheme } from '../../context/ThemeContext';
import axios from '../../utils/axiosConfig';
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
    const [accepted, setAccepted] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionUser, setSessionUser] = useState(null); // 👈 NEW
    const [selectedUser, setSelectedUser] = useState(null); // 👈 MODAL only


    useEffect(() => {
        const fetchData = async () => {
            const storedUser = JSON.parse(sessionStorage.getItem('user'));
            const sessionId = storedUser?.user?.id;

            if (!sessionId) {
                setError('No session found.');
                return;
            }

            try {
                // 1. Fetch all users
                const response = await axios.post(
                    'https://nextalk-u0y1.onrender.com/displayusersProfile',
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    }
                );

                const allUsers = response.data;
                const filteredUsers = allUsers.filter(user => user._id !== sessionId);
                const sessionUser = allUsers.find(user => user._id === sessionId);
                setSessionUser(sessionUser);

                // 2. Fetch follow status
                const followRes = await fetch(`https://nextalk-u0y1.onrender.com/follow-status/${sessionId}`);
                const followData = await followRes.json();
                setFollowing(new Set(followData.following));
                setAccepted(new Set(followData.accepted));

                // 3. Finally set users after everything else is ready
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

    const handleFollow = async (userId) => {
        const user = users.find(u => u._id === userId);

        try {
            const response = await fetch("https://nextalk-u0y1.onrender.com/follow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // if you're using sessions/cookies
                body: JSON.stringify({
                    followerId: sessionUser._id,
                    followeeId: userId
                })
            });

            const data = await response.json();

            if (response.ok) {
                setFollowing(prev => {
                    const updated = new Set(prev);
                    updated.add(userId);
                    return updated;
                });

                console.log(`You followed ${user.name} at ${data.follow.time}`);
                // Optional: Show toast or notification with data.follow.time
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Follow request failed:", error);
        }
    };


    const handleFollowAll = () => {
        const newFollowing = new Set(Requested);
        users.forEach(user => {
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
    if (loading) return <div className="custom-loader-overlay">
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
    </div>;
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
                                    <div className="image-wrapper">
                                        <Image
                                            key={sessionUser.image}
                                            src={sessionUser.image || predefine}
                                            alt={sessionUser.name}
                                            width={85}
                                            height={85}
                                            className="rounded-circle image-item"
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
                            {users.filter(user => accepted.has(user._id))
                                .map(user => (
                                    <div key={user._id} className="image-card">
                                        <div className="image-wrapper" onClick={() => setSelectedUser(user)}>
                                            <Image
                                                key={user.image}
                                                src={user.image || predefine}
                                                alt={user.name}
                                                width={85}
                                                height={85}
                                                className="image-item rounded-circle"
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
                            {users
                                .filter(user => !accepted.has(user._id) && user._id !== sessionUser._id)
                                .map(user => {
                                    const isFollowing = following.has(user._id);

                                    return (
                                        <div key={user._id} className="suggested-card">
                                            <Image
                                                src={user.image || predefine}
                                                alt={user.name}
                                                width={85}
                                                height={85}
                                                className="image-item rounded-circle"
                                            />
                                            <div className="suggested-info">
                                                <span className="suggested-name">{user.name}</span>
                                                <span className="suggested-followed-by">
                                                    Followed by {user.followedBy || "user1, user2"} + {user.followedByCount || 3} more
                                                </span>
                                                <br />
                                                {isFollowing ? (
                                                    <button disabled className="btn btn-secondary">Requested</button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleFollow(user._id)}
                                                        className="btn btn-primary"
                                                    >
                                                        Follow
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                    </section>
                </div>

                {/* Modal for Profile Preview */}
                <ModalPortal>
                    {selectedUser && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="modal-close" ><i onClick={closeModal} className="bi bi-x-lg"></i></button>
                                <div className="modal-body">
                                    {selectedUser.image ? (
                                        <Image key={selectedUser.image}
                                            width={85}
                                            height={85} src={selectedUser.image} alt={selectedUser.name} className={`modal-image ${selectedUser.isSessionUser ? 'session-user' : ''}`} />
                                    ) : (
                                        <Image src={predefine} alt={selectedUser.name} className={`modal-image ${selectedUser.isSessionUser ? 'session-user' : ''}`} />
                                    )}
                                    <h3>{selectedUser.name}</h3>
                                    <p>{selectedUser.bio || "No bio available"}</p>
                                    <button
                                        className="btn btn-outline-primary w-50 btn-sm"
                                        style={{ background: following.has(selectedUser._id) }}
                                    >
                                        Message
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