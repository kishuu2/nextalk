import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import axios from '../axiosConfig';
import predefine from "../../public/Images/predefine.webp";
import DashboardLayout from '../Components/DashboardLayout';
import Link from 'next/link';
import Image from "next/image";
import Head from 'next/head';

export default function Profile() {
    const { theme, setTheme } = useTheme(); // Assuming ThemeContext provides a setTheme function
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(profile); // Temporary state for editing

    const router = useRouter(); // corrected here

    const handleNavigate = () => {
        router.push("/Dashboard/EditProfile");
    };


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

    const handleSave = () => {
        setProfile(tempProfile);
        setIsEditing(false);
        // In a real app, you'd also send the updated profile to the server here
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
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
    // if (error) return <div className="error">{error}</div>;

    return (
        <DashboardLayout>
            <Head>
                <title>Your Profile: {profile.username}</title>
            </Head>
            {loading ? (
                // Skeleton Loading
                <div className="profile-container">
                    <div>
                        <div className="profile-card" style={{ background: styles.cardBg }}>
                            <div className="d-flex p-car">
                                <div className="profile-avatar-container">
                                    <div className="skeleton skeleton-avatar" />
                                </div>
                                <div>
                                    <div className='d-flex p-card' style={{ alignItems: "center" }}>
                                        <div className="skeleton skeleton-username ot-butt" />
                                        <div className="skeleton skeleton-button ot-butt" />
                                        <div className="skeleton skeleton-icon ot-butt" />
                                    </div><hr />
                                    <div className="d-flex p-card">
                                        <div><div className="skeleton skeleton-text" /><p className="stat-label">Posts</p></div>
                                        <div><div className="skeleton skeleton-text" /><p className="stat-label">Followers</p></div>
                                        <div><div className="skeleton skeleton-text" /><p className="stat-label">Following</p></div>
                                    </div>
                                    <div className="skeleton skeleton-line" />
                                    <div className="skeleton skeleton-line short" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Actual Profile

                <div className="profile-container" style={{ color: styles.color }}>
                    <div>
                        <div className="profile-card " style={{ background: styles.cardBg }}>
                            <div className='d-flex p-car'>
                                <div className="profile-avatar-container">

                                    <Image width={85}
                                                height={85} src={profile.image || "/Images/predefine.webp"} alt={profile.name} className="profile-avatar" />
                                </div>
                                <div>
                                    <div className='d-flex p-card' style={{ alignItems: "center" }}>
                                        <h3 className='ot-butt'>@{profile.username}</h3>
                                        <button className="btn btn-primary w-100 ot-butt" onClick={handleNavigate}>Edit Profile</button>
                                        <Link className="nav-link ot-butt" style={{ textDecoration: "none" }} href="/Dashboard/Settings">
                                            <i className="bi bi-gear-wide-connected me-2 fs-3"></i>
                                        </Link>

                                        <span className='ot-but'>{profile.name}</span>
                                    </div><hr></hr>
                                    <div className="d-flex p-card">
                                        <div><span className="stat-value">{profile.posts || "0"}</span><p className="stat-label">Posts</p></div>
                                        <div><span className="stat-value">{profile.followers || "0"}</span><p className="stat-label">Followers</p></div>
                                        <div><span className="stat-value">{profile.following || "0"}</span><p className="stat-label">Following</p></div>
                                    </div>
                                    <p className='ot-butt'>{profile.name}</p>
                                    <p className='ot-butt'>{profile.bio}</p>
                                </div>
                            </div>
                            <p className='ot-but'>{profile.bio}</p>
                            <div className='d-flex gap-2 ot-but'>
                                <button className="btn btn-primary ot-but rounded-2 w-100" onClick={handleNavigate}>Edit Profile</button>
                                <button className="btn btn-primary ot-but rounded-2 w-100" onClick={handleNavigate}>Share Profile</button>
                            </div>
                        </div>
                        {/**/}
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}