import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../axiosConfig';
import predefine from "../../public/Images/predefine.webp";
import "../styles/Profile.css";
import DashboardLayout from '../Components/DashboardLayout';

export default function EditProfile() {
    const router = useRouter();
    const [profile, setProfile] = useState({
        username: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'No bio yet.',
        avatar: predefine,
        posts: 15,
        followers: 250,
        following: 180,
    });
    const [tempProfile, setTempProfile] = useState(profile);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}');

            if (!userData?.user?.id) {
                setError('No user data found. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('https://nextalk-u0y1.onrender.com/profile', {
                    headers: {
                        Authorization: `Bearer ${userData.user.id}`,
                    },
                });
                const fetchedProfile = response.data.user || response.data;
                setProfile(fetchedProfile);
                setTempProfile(fetchedProfile);
                setLoading(false);
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to load profile.';
                setError(errorMessage);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempProfile(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
            await axios.put('https://nextalk-u0y1.onrender.com/profile', tempProfile, {
                headers: {
                    Authorization: `Bearer ${userData.user.id}`,
                },
            });
            setProfile(tempProfile);
            router.push('/Dashboard/profile');
        } catch (err) {
            setError('Failed to save profile. Please try again.');
        }
    };

    const handleCancel = () => {
        router.push('/Dashboard/Profile');
    };

    const handleNavigateToNotifications = () => {
        router.push('/notifications'); // Placeholder route for notifications
    };

    const handleVisibilityClick = () => {
        // Placeholder for visibility settings navigation or modal
        console.log("Navigating to visibility settings...");
    };

    if (loading) return <div className="loading">Just Wait Few Minutes...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <DashboardLayout>
            <div className="edit-profile-layout">
                {/* Left Sidebar */}
                <div className="edit-profile-sidebar">
                    <h2 className="sidebar-title">Settings</h2>
                    <div className="sidebar-section">
                        <h3 className="sidebar-section-title">How to use Nextalk</h3>
                        <p className="sidebar-section-content">
                            Nextalk allows you to connect with friends, share updates, and explore communities.
                            Update your profile to let others know more about you, and manage your notifications
                            to stay updated on what matters most.
                        </p>
                    </div>
                    <div className="sidebar-buttons">
                        <button className="sidebar-button active" disabled style={{alignItems:"center",display:"flex", gap:"8px"}}>
                            <i class="bi bi-person-circle" style={{fontSize: "24px"}}></i> Edit Profile
                        </button>
                        <button className="sidebar-button" style={{alignItems:"center",display:"flex", gap:"8px"}} onClick={handleNavigateToNotifications}>
                            <i class="bi bi-qr-code" style={{fontSize: "24px"}}></i> QR Code
                        </button>
                        <button className="sidebar-button" style={{alignItems:"center",display:"flex", gap:"8px"}} onClick={handleNavigateToNotifications}>
                            <i class="bi bi-bell" style={{fontSize: "24px"}}></i> Notifications
                        </button>
                    </div><br />

                    <div>
                        <div className="sidebar-section">
                            <h3 className="sidebar-section-title">Your app and media</h3>
                            <div className="sidebar-buttons">
                                <button className="sidebar-button" style={{alignItems:"center",display:"flex", gap:"8px"}}>
                                   <i class="bi bi-translate" style={{fontSize: "24px"}}></i> Language
                                </button>
                                <button className="sidebar-button" style={{alignItems:"center",display:"flex", gap:"8px"}} onClick={handleNavigateToNotifications}>
                                    <i class="bi bi-laptop" style={{fontSize: "24px"}}></i> Website permissions
                                </button>
                            </div>
                        </div>
                    </div>

                     <div>
                        <div className="sidebar-section">
                            <h3 className="sidebar-section-title">More info and support</h3>
                            <div className="sidebar-buttons">
                                <button className="sidebar-button" style={{alignItems:"center",display:"flex", gap:"8px"}}>
                                    <i class="bi bi-patch-question" style={{fontSize: "24px"}}></i> Help
                                </button>
                                <button className="sidebar-button" style={{alignItems:"center",display:"flex", gap:"8px"}} onClick={handleNavigateToNotifications}>
                                    <i class="bi bi-shield-plus" style={{fontSize: "24px"}}></i> Privacy Center
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="edit-profile-main">
                    <div className="edit-profile-card">
                        <h1 className="edit-profile-title">Edit Profile</h1>
                        <form className="edit-form" onSubmit={handleSubmit}>
                            <div className="form-group" style={{ background: "lightgray", borderRadius: "12px", padding: "12px", opacity: "0.9" }}>
                                <div className='d-flex' style={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <div className='d-flex gap-3 justify-content-center' style={{ alignItems: "center" }}>
                                        <div>
                                            <img src={profile?.avatar || "/Images/predefine.webp"} alt={profile.name} className="profile-avatar" style={{ width: "80px", height: "80px" }} />
                                        </div>
                                        <div>
                                            <span className='text-dark'>{profile.username}</span><br />
                                            <span className='text-dark'>{profile.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" className='btn btn-primary btn-sm'>Change photo</button>
                                    </div>
                                </div>

                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={tempProfile.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={tempProfile.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={tempProfile.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={tempProfile.bio}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-instructions">
                                <p>
                                    Certain profile info, like your name, bio, and links, is visible to everyone.{' '}
                                    <span className="visibility-link" onClick={handleVisibilityClick}>
                                        See what profile info is visible
                                    </span>
                                </p>
                            </div>
                            <div className="form-buttons">
                                <button type="submit" className="submit-button">
                                    Submit
                                </button>
                                <button type="button" className="cancel-button" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}