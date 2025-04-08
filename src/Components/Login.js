import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from './ThemeContext';
import '../styles/Login.css';
import Random1 from "../Images/download.png";
import Random2 from "../Images/download2.png";
import Random3 from "../Images/download3.png";
import Random4 from "../Images/download4.png";
import Random5 from "../Images/download5.png";


function Login() {
    const [formData, setFormData] = useState({ username: '', password: '', agree: false });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [progress, setProgress] = useState(0);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset previous errors
    
        // Check for required fields
        if (!formData.username || !formData.password) {
            setError('Please fill in all required fields!');
            return;
        }
    
        try {
            const response = await axios.post('https://nextalk-u0y1.onrender.com/login', formData, {
                headers: { 'Content-Type': 'application/json' }
            });
    
            // Store user data in localStorage/sessionStorage (if needed)
            localStorage.setItem("user", JSON.stringify(response.data));
    
            setSuccess("Login successful! 🎉");
    
            let progressValue = 0;
            const interval = setInterval(() => {
                progressValue += 10;
                setProgress(progressValue);
                if (progressValue >= 100) {
                    clearInterval(interval);
                    setTimeout(() => navigate('/Dashboard'), 500);
                }
            }, 300);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) { 
                    setError('Invalid Username or Password.');
                } else {
                    setError(error.response.data.error || 'Login failed. Please try again.');
                }
            } else {
                setError('Network error. Please try again.');
            }
        }
    };
    

    const { theme, handleThemeClick } = useTheme();
    const videoSrc = {
        homeback: Random1,
        homesecond: Random2,
        homethird: Random3,
        homefourth: Random4,
        homefive: Random5,
    };
    const gradients = {
        homeback: "linear-gradient(120deg, #4F1787, #003161)",
        homesecond: "linear-gradient(120deg,#7A1CAC, #2E073F)",
        homethird: "linear-gradient(120deg, #1F6E8C, #0E2954,#2E8A99)",
        homefourth: "linear-gradient(120deg, #790252,#AF0171,violet)",
        homefive: "linear-gradient(160deg, #183D3D, green)",
    };

    const themeKeys = Object.keys(videoSrc);
    const ChangeColor = () => {
        const randomIndex = Math.floor(Math.random() * themeKeys.length);
        const randomTheme = themeKeys[randomIndex];
        handleThemeClick(randomTheme); // Update theme via context
    };


    return (
        <div className="login-container">
            <div className="row g-0 shadow-lg login-wrapper">
                {/* Login Section */}
                <div className="col-md-6 login-section">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <strong>Alert!</strong> {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success" role="alert">
                            <strong>Success!</strong> {success}
                            <div className="progress mt-2" style={{ height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                    role="progressbar"
                                    style={{ width: `${progress}%`, transition: "width 0.3s ease-in-out" }}
                                ></div>
                            </div>
                        </div>
                    )}
                    <div className="card-body">
                        <h2 className="text-center mb-4 text-primary">Welcome Back</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label fw-bold">Username</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label fw-bold">Password</label>
                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div><br/><br/>
                            <button type="submit" className="btn btn-primary btn-lg w-100 login-btn">
                                Login
                            </button><br /><br />
                            <Link to="" className="btn btn-lg btn-primary w-100 login-btn" style={{ textDecoration: "none" }}>
                                Forgotten password
                            </Link>
                        </form>
                    </div>
                </div>

                {/* Create Account Section */}
                <div className="col-md-6 create-section" id='two'>
                    <div
                        className="Randomimages1"
                        style={{
                            backgroundImage: `url(${videoSrc[theme]}), ${gradients[theme]}`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            backgroundBlendMode: "overlay",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 0, // Background behind content
                            transition: "background-image 0.5s ease", // Smooth transition
                        }}
                    ></div>

                    <div className="rand" onClick={ChangeColor} style={{ zIndex: 3, position: "absolute", top: "20px", right: "20px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-dice-5-fill" viewBox="0 0 16 16">
                            <path d="M3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3zm2.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M5.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M8 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                        </svg></div>
                    <div className='create-section1 text-center d-flex align-items-center justify-content-center'>
                        <div className="p-2">
                            <h3 className="text-white mb-3">New Here?</h3>
                            <p className="text-white mb-4">
                                Don’t have an account yet? Create one now and join the conversation!
                            </p>
                            <button
                                className="btn btn-outline-light btn-lg create-btn"
                                onClick={() => navigate('/Signup')}
                            >
                                Create New Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;