// DashboardLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";
import { useTheme } from '../ThemeContext';
import "../../styles/DashboardLayout.css";

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, handleThemeClick } = useTheme(); // Only using what's available from original context
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/"); // Redirect to login
    };

    // Toggle between light and dark themes
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        handleThemeClick(newTheme);
    };

    // Define simple theme styles since they're not in the context
    const getThemeStyles = () => {
        return theme === 'dark' 
            ? { background: '#212529', color: '#ffffff', chatBackground: '#343a40' }
            : { background: '#ffffff', color: '#333', chatBackground: '#f8f9fa' };
    };

    const currentThemeStyles = getThemeStyles();

     const [user, setUser] = useState(null);
      const navigates = useNavigate();
    
      useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
          navigates("/");
        }
      }, [navigates]);
      
      useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed.user); // 👈 only storing inner user object in state
          } catch (err) {
            console.error("Error parsing sessionStorage user:", err);
          }
        }
      }, []);
    return (
        <div className="dashboard-wrapper" style={{ background: currentThemeStyles.background, color: currentThemeStyles.color }}>
            {/* Mobile Navbar */}
            <nav className={`navbar bg-${theme} text-${theme === 'dark' ? 'light' : 'dark'} d-lg-none`}>
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/dashboard">Nextalk</Link>
                    <button
                        className="navbar-toggler"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
            </nav>

            {/* Sidebar */}
            <aside className={`sidebar bg-${theme} text-${theme === 'dark' ? 'light' : 'dark'} ${isSidebarOpen ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <h4 className="p-3 border-bottom d-none d-lg-block">Nextalk</h4>
                    <button
                        className="btn-close p-3 d-lg-none text-light"
                        onClick={() => setIsSidebarOpen(false)}
                    ></button>
                </div>

                <ul className="nav flex-column p-3">
                    <li className="nav-item">
                        <Link className="nav-link" to="/dashboard" onClick={() => setIsSidebarOpen(false)}>
                            <i className="bi bi-house me-2"></i>Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dashboard/chats" onClick={() => setIsSidebarOpen(false)}>
                            <i className="bi bi-chat me-2"></i>Chats
                        </Link>
                    </li>
                </ul>

                <div className="sidebar-footer p-3 border-top">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <img src="https://static.vecteezy.com/system/resources/thumbnails/050/609/573/small/a-white-person-icon-in-a-hexagon-png.png" width="50px" alt="User" className="rounded-circle img-fluid mx-auto me-2" />
                            <div>
                                <small className="d-block">{user?.name || "Guest"}</small>
                                <small>Online</small>
                            </div>
                        </div>
                    </div>  
                    <br/><br/>
                    <div>
                            <button 
                                onClick={toggleTheme} 
                                className="btn btn-outline-secondary me-2 w-100"
                            >
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </button><br/><br/>
                            <button 
                                onClick={handleLogout} 
                                className="btn btn-outline-danger w-100"
                            >
                                Log out
                            </button>
                        </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content" style={{ background: currentThemeStyles.chatBackground }}>
                <div className="container-fluid p-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}