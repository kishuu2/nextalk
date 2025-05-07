import React, { useState, useEffect } from 'react';
import { useTheme } from '../Components/ThemeContext';
import axios from '../axiosConfig';
import predefine from "../../public/Images/predefine.webp";
import "../styles/Profile.css";
import DashboardLayout from '../Components/DashboardLayout';

export default function Profile() {
    const { theme } = useTheme();
    const [profile, setProfile] = useState({
        username: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'No bio yet.',
        avatar: predefine,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
            
            // Validate userData
            if (!userData?.user?.id) {
                setError('No user data found. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('/profile', {
                    headers: {
                        Authorization: `Bearer ${userData.user.id}`,
                    },
                });
                console.log('Profile response:', response.data); // Debug response
                setProfile(response.data.user || response.data); // Handle nested or direct data
                setLoading(false);
            } catch (err) {
                console.error('Error fetching profile:', err.message, err.response?.data);
                const errorMessage = err.response?.data?.message || 'Failed to load profile. Please try again later.';
                setError(errorMessage);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return { 
                background: '#1e293b', 
                color: '#e2e8f0', 
                cardBg: '#334155', 
                buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
                buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)',
            };
        }
        return { 
            background: '#f1f5f9', 
            color: '#1e293b', 
            cardBg: '#ffffff', 
            buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
            buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)',
        };
    };

    const styles = getThemeStyles();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleFlip = () => setFlipped(prev => !prev);

    if (loading) return <div className="loading">Loading profile...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <DashboardLayout>
            <div className="profile-container" style={{ background: styles.background, color: styles.color }}>
                <h1 className="profile-title">Your Profile</h1>

                <div className="profile-grid">
                    <section className="edit-section">
                        <h2 className="section-title">Edit Profile</h2>
                        {isEditing ? (
                            <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={profile.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleInputChange}
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Profile Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                <div className="form-buttons">
                                    <button type="submit" className="save-btn" style={{ background: styles.buttonGradient }}>
                                        Save
                                    </button>
                                    <button 
                                        type="button" 
                                        className="cancel-btn" 
                                        onClick={() => setIsEditing(false)}
                                        style={{ background: styles.buttonHover }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button 
                                className="edit-btn" 
                                onClick={() => setIsEditing(true)}
                                style={{ background: styles.buttonGradient }}
                            >
                                Edit Profile
                            </button>
                        )}
                    </section>

                    <section className="preview-section">
                        <h2 className="section-title">Profile Preview</h2>
                        <div className="preview-card-container">
                            <div 
                                className={`preview-card ${flipped ? 'flipped' : ''}`}
                                onClick={toggleFlip}
                            >
                                <div className="card-front" style={{ background: styles.cardBg }}>
                                    <img 
                                        src={profile.avatar} 
                                        alt={profile.name} 
                                        className="preview-avatar" 
                                    />
                                    <span className="preview-name">{profile.name}</span>
                                </div>
                                <div className="card-back" style={{ background: styles.cardBg }}>
                                    <span className="preview-bio">{profile.bio}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}