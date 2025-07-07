// DashboardLayout.jsx
'use client'; // if you're using App Router (recommended)

import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from 'next/image';
import predefine from "../../public/Images/predefine.webp";
import { useTheme } from '../../context/ThemeContext';
import axios from '../../utils/axiosConfig';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, handleThemeClick } = useTheme();
    const router = useRouter(); // corrected here

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        handleThemeClick(newTheme);
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return { background: '#0f172a', color: '#e2e8f0', chatBackground: '#1e293b', cardBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' };
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
        if (typeof window !== 'undefined') {
            fetchProfile();
        }
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


    const [showConfirm, setShowConfirm] = useState(false);
    const handleLogout = () => {
        setShowConfirm(true);
    };

    const handleConfirmUpload = async (e) => {
        sessionStorage.removeItem("user");
        router.push("/");
    }

    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                const storedUser = JSON.parse(sessionStorage.getItem("user"));
                const sessionId = storedUser?.user?.id;

                if (!sessionId) {
                    console.log("No session ID found, skipping pending requests fetch");
                    return;
                }

                // Add timeout and better error handling
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const res = await axios.get(
                    `https://nextalk-u0y1.onrender.com/pending-follow-requests/${sessionId}`,
                    {
                        signal: controller.signal,
                        timeout: 10000,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                clearTimeout(timeoutId);
                setPendingCount(res.data.count || 0);
                console.log("✅ Pending requests fetched successfully:", res.data.count);

            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log("⏰ Request timeout - skipping pending requests");
                } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
                    console.log("🌐 Network error - will retry later");
                } else {
                    console.error("❌ Failed to fetch pending request count:", err.message);
                }
                // Set default count on error
                setPendingCount(0);
            }
        };

        // Initial fetch with delay to avoid immediate network issues
        const initialTimeout = setTimeout(() => {
            fetchPendingRequests();
        }, 2000);

        // OPTIONAL: Poll every 60s for updates (increased interval to reduce network load)
        const interval = setInterval(fetchPendingRequests, 60000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [sessionUserId, setSessionUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const storedUser = JSON.parse(sessionStorage.getItem("user"));
            const sessionId = storedUser?.user?.id;
            setSessionUserId(sessionId);

            try {
                const response = await axios.post(
                    "https://nextalk-u0y1.onrender.com/displayusersProfile",
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                    }
                );

                const allUsers = response.data;
                const filtered = allUsers.filter(user => user._id !== sessionId);
                setUsers(filtered);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSearchResults(results);
    }, [searchTerm, users]);


    return (
        <div className="dashboard-wrapper" style={{ background: currentThemeStyles.background, color: currentThemeStyles.color }}>
            {/* Mobile Navbar */}
            <nav className={`navbar sleek-navbar ${theme === 'dark' ? 'bg-dark' : 'bg-light'} d-lg-none`}>
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold sleek-brand" style={{ textDecoration: "none" }} href="/dashboard/profile">{brandText}</Link>
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
                </div>

                <ul className="nav flex-column p-3 sleek-nav">
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard">
                            <i className="bi bi-house-fill me-2"></i>Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link sleek-nav-link w-100" data-bs-toggle="offcanvas" data-bs-target="#Search" style={{ textDecoration: "none" }}>
                            <i className="bi bi-search me-2"></i>Search
                        </button>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Chats">
                            <i className="bi bi-box me-2"></i>Chat with Random
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Chats">
                            <i className="bi bi-plus-square me-2"></i>Create
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Messages">
                            <i className="bi bi-chat-fill me-2"></i>Messages
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Chats">
                            <i className="bi bi-cpu me-2"></i>Chat with NexTalk
                        </Link>
                    </li>
                    <li className="nav-item ot-but">
                        <Link className="nav-link sleek-nav-link" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Settings">
                            <i className="bi bi-gear-wide-connected me-2"></i>Settings
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sleek-nav-link justify-content-between" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: "none" }} href="/Dashboard/Notification">
                            <div>
                                <i className="bi bi-heart me-2"></i>Notification
                            </div>
                            {pendingCount > 0 && (
                                <span
                                    style={{
                                        backgroundColor: "#008080",
                                        color: "white",
                                        fontSize: "0.7rem",
                                        padding: "6px 12px",
                                        borderRadius: "50%",
                                        top: "10px",
                                        right: "10px",
                                    }}
                                >
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    </li><br />
                    <li className='nav-item'>
                        <Link href=""
                            className="btn btn-primary w-100 p-2 d-lg-none" style={{ textDecoration: "none" }}
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                        >Close </Link></li>
                </ul>


                <div className="sidebar-footer p-3 sleek-footer">
                    {loading ? (
                        <Link href='/Dashboard/Profile' onClick={() => setIsSidebarOpen(false)} style={{ background: "darkgray", textDecoration: "none" }} className="user-profile sleek-profile nav-link d-flex align-items-center gap-3">
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
                                    <Image
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
                {showConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4 className="modal-title">Log Out?</h4>
                            <p className="modal-text">
                                Are you sure you want to log out? You will be signed out of your account and redirected to the login page.
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
                <div className="offcanvas offcanvas-start" style={{ background: currentThemeStyles.cardBg, color: currentThemeStyles.color }} id="Search">
                    <div className="offcanvas-header">
                        <h3 className="offcanvas-title">Search</h3>
                        <button type="button" className="btn-close bg-danger" data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div className="offcanvas-body">
                        <input
                            type="search"
                            name="search"
                            id="search"
                            className="form-control mb-3"
                            placeholder="Search users..."
                            value={searchTerm}
                            style={{
                                backgroundColor: "white",
                                transition: "background 0.3s",
                                gap: "10px",
                                border: "1px solid #333"
                            }}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "white"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "whitesmock"}
                        />
                        {
                            loading ? (
                                <div className='d-flex gap-4'>
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
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {searchResults.map(user => (
                                        <div
                                            key={user._id}
                                            className="d-flex gap-4 align-items-center user-result mb-2 p-2 rounded"
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Image
                                                src={user.image || predefine}
                                                alt={user.name}
                                                width={60}
                                                height={60}
                                                className="rounded-circle"
                                                style={{ objectFit: "cover" }}
                                            />
                                            <div>
                                                <strong>{user.username}</strong><br />
                                                <span>{user.name}</span>
                                            </div>
                                        </div>

                                    ))}

                                    {searchResults.length === 0 && searchTerm && (
                                        <div className="text-center mt-4 fade-in">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="64"
                                                height="64"
                                                fill="gray"
                                                viewBox="0 0 24 24"
                                                style={{ opacity: 0.5 }}
                                            >
                                                <path d="M10 2a8 8 0 015.293 13.707l5 5a1 1 0 01-1.414 1.414l-5-5A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z" />
                                            </svg>
                                            <p className="mt-2">No users found</p>
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    </div>
                </div>

            </main>
        </div>
    );
}
