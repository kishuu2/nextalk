// DashboardLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from '../ThemeContext';
import "../../styles/DashboardLayout.css";
import predefine from "../../Images/predefine.webp";

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, handleThemeClick } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/");
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        handleThemeClick(newTheme);
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return { 
                background: '#0f172a', 
                color: '#e2e8f0', 
                chatBackground: '#1e293b' 
            };
        }
        // Default to light styles for 'homeback' or any other theme
        return { 
            background: '#f1f5f9', 
            color: '#1e293b', 
            chatBackground: '#ffffff' 
        };
    };

    const currentThemeStyles = getThemeStyles();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
            navigate("/");
        } else {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed.user);
            } catch (err) {
                console.error("Error parsing sessionStorage user:", err);
                navigate("/");
            }
        }
    }, [navigate]);

    return (
        <div className="dashboard-wrapper" style={{ background: currentThemeStyles.background, color: currentThemeStyles.color }}>
            {/* Mobile Navbar */}
            <nav className={`navbar sleek-navbar ${theme === 'dark' ? 'bg-dark' : 'bg-light'} d-lg-none`}>
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold sleek-brand" to="/dashboard" style={{textDecoration:"none"}}>Nextalk</Link>
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
                    <h4 className="p-3 fw-bold text-uppercase d-none d-lg-block">Nextalk</h4>
                    <button
                        className="btn-close p-3 d-lg-none sleek-close"
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                    ></button>
                </div>

                <ul className="nav flex-column p-3 sleek-nav">
                    <li className="nav-item">
                        <Link 
                            className="nav-link sleek-nav-link" style={{textDecoration:"none"}}
                            to="/dashboard" 
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <i className="bi bi-house-fill me-2"></i>Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            className="nav-link sleek-nav-link" style={{textDecoration:"none"}}
                            to="/dashboard/chats" 
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <i className="bi bi-chat-fill me-2"></i>Chats
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            className="nav-link sleek-nav-link" style={{textDecoration:"none"}}
                            to="/dashboard/settings" 
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <i className="bi bi-gear-wide-connected me-2"></i>Settings
                        </Link>
                    </li>
                </ul>

                <div className="sidebar-footer p-3 sleek-footer">
                    <div className="user-profile sleek-profile d-flex align-items-center gap-3">
                        <img 
                            src={predefine} 
                            width="45" 
                            alt="User" 
                            className="rounded-circle sleek-avatar"
                        />
                        <div>
                            <span className="d-block fw-semibold sleek-username">{user?.name || "Guest"}</span>
                            <span className="sleek-status online">Online</span>
                        </div>
                    </div>
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
                    <Outlet />
                </div>
            </main>
        </div>
    );
}