// DashboardLayout.jsx
'use client'; // if you're using App Router (recommended)

import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from 'next/image';
import "../styles/DashboardLayout.css";
import predefine from "../../public/Images/predefine.webp";
import { useTheme } from './ThemeContext';
import axios from '../axiosConfig';
import "../styles/Home.css";

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, handleThemeClick } = useTheme();
    const router = useRouter(); // corrected here

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        router.push("/");
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        handleThemeClick(newTheme);
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return { background: '#0f172a', color: '#e2e8f0', chatBackground: '#1e293b' };
        }
        return { background: '#f1f5f9', color: '#1e293b', chatBackground: '#ffffff' };
    };

    const currentThemeStyles = getThemeStyles();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
            router.push("/");
        } else {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed.user);
            } catch (err) {
                console.error("Error parsing sessionStorage user:", err);
                router.push("/");
            }
        }
    }, [router]);

    const [profile, setProfile] = useState(null);

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
        fetchProfile();
    }, []);

    const pathname = usePathname();
    const [brandText, setBrandText] = useState("Nextalk");
    useEffect(() => {
        if (pathname === "/Dashboard/Profile") {
            setBrandText(profile?.name || "User");
        } else {
            setBrandText("Nextalk");
        }
    }, [pathname, profile]);

    return (
        <div className="dashboard-wrapper" style={{ background: currentThemeStyles.background, color: currentThemeStyles.color }}>
            {/* Mobile Navbar */}
            <nav className={`navbar sleek-navbar ${theme === 'dark' ? 'bg-dark' : 'bg-light'} d-lg-none`}>
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold sleek-brand" style={{textDecoration: "none"}} href="/dashboard/profile">{brandText}</Link>
                    <button
                        className={`navbar-toggler sleek-toggler ${theme === 'dark' ? 'dark-toggler' : 'light-toggler'}`}
                        type="button"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
            </nav>

            {/* Sidebar */}
            <aside className={`sidebar sleek-sidebar ${theme === 'dark' ? 'bg-dark' : 'bg-light'} ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header sleek-header">
                    <h4 className="p-3 fw-bold text-uppercase d-none d-lg-block">{brandText}</h4>
                    <button
                        className="btn-close p-3 d-lg-none sleek-close"
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                    ></button>
                </div>

                <ul className="nav flex-column p-3 sleek-nav">
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard">
                            <i className="bi bi-house-fill me-2"></i>Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Chats">
                            <i className="bi bi-search me-2"></i>Search
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Chats">
                            <i className="bi bi-plus-square me-2"></i>Create
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Chats">
                            <i className="bi bi-chat-fill me-2"></i>Messages
                        </Link>
                    </li>
                    <li className="nav-item ot-but">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Settings">
                            <i className="bi bi-gear-wide-connected me-2"></i>Settings
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Notification">
                            <i className="bi bi-heart me-2"></i>Notification
                        </Link>
                    </li>
                </ul>


                <div className="sidebar-footer p-3 sleek-footer">
                    {loading ? (
                        <Link href='/Dashboard/Profile' onClick={() => setIsSidebarOpen(false)} style={{background: "darkgray", textDecoration: "none" }} className="user-profile sleek-profile nav-link d-flex align-items-center gap-3">
                            <div
                                className="skeleton"
                                style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                }}
                            ></div>
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
                                <span className="sleek-status online">Online</span>
                            </div>
                        </Link>
                    ) :
                        (
                            <Link href='/Dashboard/Profile' onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} className="user-profile sleek-profile nav-link d-flex align-items-center gap-3">
                                {profile && (
                                    <img
                                        key={profile.image}
                                        src={profile.image || "/Images/predefine.webp"}
                                        width={45}
                                        height={45}
                                        alt="User"
                                        className="rounded-circle sleek-avatar"
                                    />
                                )}
                                <div>
                                    <span className="d-block fw-semibold sleek-username">{profile.name || "Guest"}</span>
                                    <span className="sleek-status online">Online</span>
                                </div>
                            </Link>
                        )
                    }
                    <div className="mt-4 sleek-actions">
                        <button
                            onClick={toggleTheme}
                            className="btn sleek-btn theme-toggle w-100 mb-2"
                        >
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn sleek-btn logout-btn w-100"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content sleek-main" style={{ background: currentThemeStyles.chatBackground }}>
                <div className="container-fluid p-1 sleek-container">
                    {children} {/* NOT Outlet! */}
                </div>
            </main>
        </div>
    );
}
