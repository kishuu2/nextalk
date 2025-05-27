import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import axios from '../../utils/axiosConfig';
import predefine from "../../public/Images/predefine.webp";
import DashboardLayout from '../Components/DashboardLayout';
import Head from 'next/head';
import Image from 'next/image';

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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchProfile();
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempProfile(prev => ({ ...prev, [name]: value }));
        setFormDatas(prev => ({ ...prev, [name]: value }));
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

    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Trigger hidden input
    };

    const [formData, setFormData] = useState({
        image: null, // Store Base64 string here
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            setFormData({ ...formData, image: reader.result }); // Store Base64 string
        };

        if (file && file.size < 5 * 1024 * 1024) { // Limit file size to 5MB
            reader.readAsDataURL(file);
            console.log(formData.image);
            setShowConfirm(true);
        } else {
            alert("File size should be less than 5MB.");
        }
    };

    const handleConfirmUpload = async (e) => {
        e.preventDefault();

        const userData = JSON.parse(sessionStorage.getItem('user'));
        const payload = {
            id: userData.user.id,
            image: formData.image,
        };
        console.log("Data to be sent:", payload);
        console.log("Base64 size:", formData.image.length);

        try {
            const response = await fetch("https://nextalk-u0y1.onrender.com/update-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Response from backend:", result);
                setShowConfirm(false);
                await fetchProfile();

            } else {
                console.error("Error submitting data:", response.statusText);
                alert("Oops!, Try again . . .");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error showing please try again somtimes!");
        }
    };
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 4000); // 8 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        const userData = JSON.parse(sessionStorage.getItem("user"));
        if (!userData?.user?.id) {
            alert("User not logged in");
            return;
        }

        const updatedData = {
            id: userData.user.id,
            username: tempProfile.username,
            name: tempProfile.name,
            email: tempProfile.email,
            bio: tempProfile.bio || "", // Add if missing, update if exists
        };
        console.log(updatedData);

        try {
            const response = await fetch("https://nextalk-u0y1.onrender.com/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Profile updated:", result);
                alert("Profile successfully updated!");
                setProfile(updatedData); // Optimistically update UI
            } else {
                console.error("Profile update failed:", response.statusText);
                alert("Error updating profile. Try again.");
            }
        } catch (err) {
            console.error("Request error:", err);
            alert("Server error occurred.");
        }
    };

    const [usernameExists, setUsernameExists] = useState(null);
    const [emailExists, setEmailExists] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [formDatas, setFormDatas] = useState({ email: '', username: '' });

    useEffect(() => {

        const checkUsername = async () => {

            const userData = JSON.parse(sessionStorage.getItem("user")); // Always pull from session
            const currentUsername = userData.user.username;
            const inputUsername = formDatas.username?.trim();

            // 👉 If no input, reset check
            if (!inputUsername) {
                setUsernameExists(null);
                return;
            }

            // ✅ If same as current username — skip check
            if (inputUsername === currentUsername) {
                setUsernameExists(null); // Not a problem; no alert shown
                return;
            }

            setCheckingUsername(true);

            try {
                const response = await axios.post("https://nextalk-u0y1.onrender.com/check-username", {
                    username: inputUsername,
                });

                setUsernameExists(response.data.exists); // true = taken, false = available
            } catch (error) {
                console.error("Username check error:", error);
                setUsernameExists(false); // fallback
            } finally {
                setCheckingUsername(false);
            }
        };

        const delay = setTimeout(() => {
            checkUsername();
        }, 600); // debounce typing

        return () => clearTimeout(delay);
    }, [formDatas.username]);



    useEffect(() => {

        const checkEmail = async () => {

            const userData = JSON.parse(sessionStorage.getItem("user")); // Always pull from session
            const currentUsername = userData.user.email;
            const inputUsername = formDatas.email?.trim();

            // 👉 If no input, reset check
            if (!inputUsername) {
                setEmailExists(null);
                return;
            }

            // ✅ If same as current username — skip check
            if (inputUsername === currentUsername) {
                setEmailExists(null); // Not a problem; no alert shown
                return;
            }

            setCheckingEmail(true);

            try {
                const response = await axios.post("https://nextalk-u0y1.onrender.com/check-email", {
                    email: inputUsername,
                });

                setEmailExists(response.data.exists); // true = taken, false = available
            } catch (error) {
                console.error("Username check error:", error);
                setEmailExists(false); // fallback
            } finally {
                setCheckingEmail(false);
            }
        };

        const delay = setTimeout(() => {
            checkEmail();
        }, 600); // debounce typing

        return () => clearTimeout(delay);
    }, [formDatas.email]);

    if (error) return <div className="error">{error}</div>;
    return (
        <DashboardLayout>
            <Head>
                <title>Edit Your Profile: {profile.username}</title>
            </Head>

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
                                                {profile && (
                                                    <Image
                                                        key={profile.image}
                                                        src={profile.image || "/Images/predefine.webp"}
                                                        width={85}
                                                        height={85}
                                                        alt="User"
                                                        className="rounded-circle sleek-avatar"
                                                    />)}
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
                            {/* Show only one of these alert sections at a time */}
                            {checkingUsername ? (
                                <div className="alert alert-secondary" role="alert">
                                    <strong>Checking...</strong> ⏳ Checking username...
                                </div>
                            ) : usernameExists !== null && formDatas.username && !checkingUsername ? (
                                <div
                                    className={`alert ${usernameExists ? 'alert-danger' : 'alert-success'}`}
                                    role="alert"
                                >
                                    {usernameExists
                                        ? <span>❌ This username is already taken.</span>
                                        : <span>✅ This username is available.</span>}
                                </div>
                            ) : checkingEmail ? (
                                <div className="alert alert-secondary" role="alert">
                                    <strong>Checking...</strong> ⏳ Checking email...
                                </div>
                            ) : emailExists !== null && formDatas.email && !checkingEmail ? (
                                <div
                                    className={`alert ${emailExists ? 'alert-danger' : 'alert-success'}`}
                                    role="alert"
                                >
                                    {emailExists
                                        ? <span>❌ This E-mail is already taken.</span>
                                        : <span>✅ This E-mail is available.</span>}
                                </div>
                            ) : null}


                            {visible ? (
                                <div className="custom-alert-container">
                                    <div className="custom-alert">
                                        <strong>⚠ Warning!</strong> Profile image must be under 30KB
                                        <div className="timer-bar" />
                                    </div>
                                </div>
                            ) : null}
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
                                <button type="submit" onClick={handleProfileSubmit} className="submit-button">
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