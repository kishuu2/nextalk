import { useState, useEffect } from "react";
import { useTheme } from '../ThemeContext';
import axios from '../../axiosConfig'; // Assuming axios is configured here
import "../../styles/Home.css";

export default function Home() {
    const { theme } = useTheme();
    const [users, setUsers] = useState([]);
    const [following, setFollowing] = useState(new Set());
    const [pendingRequests, setPendingRequests] = useState(new Set());
    const [flipped, setFlipped] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users from backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
              const response = await axios.get('https://nextalk-u0y1.onrender.com/api/users/display-users', {
                withCredentials: true,
            });
            
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again.');
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return { 
                background: '#1e293b', 
                color: '#e2e8f0', 
                cardBg: '#334155', 
                buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
                buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)'
            };
        }
        return { 
            background: '#f1f5f9', 
            color: '#1e293b', 
            cardBg: '#ffffff', 
            buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
            buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)'
        };
    };

    const styles = getThemeStyles();

    const handleFollow = (userId) => {
        setFollowing(prev => {
            const newFollowing = new Set(prev);
            if (newFollowing.has(userId)) {
                newFollowing.delete(userId);
            } else {
                newFollowing.add(userId);
            }
            return newFollowing;
        });
        // Optionally, send follow status to backend here
    };

    const handleAccept = (userId) => {
        setPendingRequests(prev => {
            const newRequests = new Set(prev);
            newRequests.delete(userId);
            return newRequests;
        });
        setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, isRequesting: false } : user
        ));
        // Optionally, send accept status to backend here
    };

    const toggleFlip = (userId) => {
        setFlipped(prev => {
            const newFlipped = new Set(prev);
            if (newFlipped.has(userId)) {
                newFlipped.delete(userId);
            } else {
                newFlipped.add(userId);
            }
            return newFlipped;
        });
    };

    const followUsers = users.filter(user => !user.isRequesting);
    const requestUsers = users.filter(user => user.isRequesting);

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="home-container" style={{ background: styles.background, color: styles.color }}>
            <h1 className="home-title">Discover the Community</h1>

            {/* Follow Section */}
            <section className="user-section">
                <h2 className="section-title">People to Follow</h2>
                <div className="user-list">
                    {followUsers.map(user => (
                        <div 
                            key={user._id} // Use _id from MongoDB
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