import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../Components/ThemeContext';
import axios from '../axiosConfig';
import predefine from "../../public/Images/predefine.webp";
import "../styles/Profile.css";
import DashboardLayout from '../Components/DashboardLayout';

export default function EditProfile() {
    const { theme, setTheme } = useTheme();
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#e2e8f0',
                cardBg: 'rgba(255, 255, 255, 0.1)',
                buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
                buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)',
            };
        }
        return {
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            color: '#1e293b',
            cardBg: 'rgba(255, 255, 255, 0.9)',
            buttonGradient: 'linear-gradient(45deg, #3b82f6, #60a5fa)',
            buttonHover: 'linear-gradient(45deg, #2563eb, #3b82f6)',
        };
    };

    const styles = getThemeStyles();

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
                const response = await axios.get('http://localhost:5000/profile', {
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

    if (error) return <div className="error">{error}</div>;
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Trigger hidden input
    };

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setShowConfirm(true); // Show confirmation modal

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result; // Base64 string (e.g., "data:image/jpeg;base64,...")
                setSelectedFile(base64String); // Store Base64 string for upload
                setTempProfile(prev => ({ ...prev, avatar: base64String })); // Preview the image
                setShowConfirm(true); // Show confirmation modal
            };

            reader.readAsDataURL(file); // Convert image to Base64
        }

    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadError(null);

        try {
            const response = await axios.post(
                "https://nextalk-u0y1.onrender.com/update-image",
                { image: selectedFile },
                {
                    withCredentials: true, // 🔥 SENDS the session cookie
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            setProfile(prev => ({ ...prev, avatar: data.imageUrl }));
            setTempProfile(prev => ({ ...prev, avatar: data.imageUrl }));
            setShowConfirm(false);
            setSelectedFile(null);
        } catch (err) {
            console.error("Upload error:", err);
            setUploadError(err.response?.data?.message || "Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };


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
                        <button className="sidebar-button active" disabled style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                            <i className="bi bi-person-circle" style={{ fontSize: "24px" }}></i> Edit Profile
                        </button>
                        <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                            <i className="bi bi-qr-code" style={{ fontSize: "24px" }}></i> QR Code
                        </button>
                        <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                            <i className="bi bi-bell" style={{ fontSize: "24px" }}></i> Notifications
                        </button>
                    </div><br />

                    <div>
                        <div className="sidebar-section">
                            <h3 className="sidebar-section-title">Your app and media</h3>
                            <div className="sidebar-buttons">
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                                    <i className="bi bi-translate" style={{ fontSize: "24px" }}></i> Language
                                </button>
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                                    <i className="bi bi-laptop" style={{ fontSize: "24px" }}></i> Website permissions
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="sidebar-section">
                            <h3 className="sidebar-section-title">More info and support</h3>
                            <div className="sidebar-buttons">
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                                    <i className="bi bi-patch-question" style={{ fontSize: "24px" }}></i> Help
                                </button>
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                                    <i className="bi bi-shield-plus" style={{ fontSize: "24px" }}></i> Privacy Center
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
                            {loading ? (
                                <div className="form-group" style={{ background: "darkgray", borderRadius: "12px", padding: "12px", opacity: "0.9" }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex gap-3 align-items-center">
                                            {/* Avatar Skeleton */}
                                            <div
                                                className="skeleton"
                                                style={{
                                                    width: "80px",
                                                    height: "80px",
                                                    borderRadius: "50%",
                                                }}
                                            ></div>

                                            {/* Text Skeleton */}
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
                                                <div
                                                    className="skeleton"
                                                    style={{
                                                        width: "100px",
                                                        height: "16px",
                                                        borderRadius: "4px",
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Button Skeleton */}
                                        <div
                                            className="skeleton ot-butt"
                                            style={{
                                                width: "100px",
                                                height: "32px",
                                                borderRadius: "6px",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group" style={{ background: "lightgray", borderRadius: "12px", padding: "12px", opacity: "0.9" }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex gap-3 align-items-center">
                                            <div onClick={handleButtonClick} style={{ cursor: "pointer" }}>
                                                <img
                                                    src={profile?.avatar || "/Images/predefine.webp"}
                                                    alt={profile.name}
                                                    className="profile-avatar"
                                                    style={{ width: "80px", height: "80px" }}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-dark">{profile.username}</span>
                                                <br />
                                                <span className="text-dark">{profile.name}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm ot-butt"
                                                onClick={handleButtonClick}
                                            >
                                                Change photo
                                            </button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                style={{ display: "none" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}


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

            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4 className="modal-title">Update Profile Photo?</h4>
                        <p className="modal-text">
                            Are you sure you want to change your profile picture? This action will overwrite your existing one.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn modal-btn-success" onClick={handleConfirmUpload}>
                                ✅ Confirm !
                            </button>
                            <button className="modal-btn modal-btn-cancel" onClick={() => setShowConfirm(false)}>
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}