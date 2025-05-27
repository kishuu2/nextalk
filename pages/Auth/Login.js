import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from '../../utils/axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Head from 'next/head';

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '', agree: false });
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const { theme, handleThemeClick } = useTheme();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setProgress(10);

        if (!formData.username || !formData.password) {
            setError('Please fill in all required fields!');
            setLoading(false);
            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 80) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 20;
            });
        }, 200);

        try {
            const response = await axios.post('https://nextalk-u0y1.onrender.com/login', formData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            sessionStorage.setItem("user", JSON.stringify(response.data));
            setSuccess("Login successful! 🎉");

            router.replace('/Dashboard');
        } catch (error) {
            setProgress(0);
            if (error.response) {
                if (error.response.status === 401) {
                    setError('Invalid Username or Password.');
                } else {
                    setError(error.response.data.error || 'Login failed. Please try again.');
                }
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const videoSrc = {
        homeback: "/Images/download.png",
        homesecond: "/Images/download2.png",
        homethird: "/Images/download3.png",
        homefourth: "/Images/download4.png",
        homefive: "/Images/download5.png",
    };
    const gradients = {
        homeback: "linear-gradient(120deg, #4F1787, #003161)",
        homesecond: "linear-gradient(120deg, #7A1CAC, #2E073F)",
        homethird: "linear-gradient(120deg, #1F6E8C, #0E2954, #2E8A99)",
        homefourth: "linear-gradient(120deg, #790252, #AF0171, violet)",
        homefive: "linear-gradient(160deg, #183D3D, green)",
    };

    const themeKeys = Object.keys(videoSrc);

    // Fallback to 'homeback' if theme isn’t in videoSrc
    const currentTheme = themeKeys.includes(theme) ? theme : 'homeback';


    const ChangeColor = () => {
        const randomIndex = Math.floor(Math.random() * themeKeys.length);
        const randomTheme = themeKeys[randomIndex];
        handleThemeClick(randomTheme);
    };

    // Optional: Persist theme in localStorage
    useEffect(() => {
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    return (
        <>{loading && !error &&(
            <div className="custom-loader-overlay">
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
            </div>
        )}
            <div className="login-container">
                <Head>
                    <title>Login in NexTalk</title>
                </Head>
                <div className="row g-0 shadow-lg login-wrapper">
                    {/* Login Section */}
                    <div className="col-md-6 login-section">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <strong>Alert!</strong> {error}
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
                                </div>
                                <br /><br />
                                <button type="submit" className="btn btn-primary w-100 login-btn">
                                    Login
                                </button>
                                <br /><br />
                                <Link href="/Auth/Forgot" className="btn btn-lg btn-primary w-100 login-btn" style={{ textDecoration: "none" }}>
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
                                backgroundImage: `url(${videoSrc[currentTheme]}), ${gradients[currentTheme]}`,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                backgroundBlendMode: "overlay",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                zIndex: 0,
                                transition: "background-image 0.5s ease",
                            }}
                        ></div>

                        <div className="rand" onClick={() => console.log('Theme before change:', theme) || ChangeColor()} style={{ zIndex: 3, position: "absolute", top: "20px", right: "20px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-dice-5-fill" viewBox="0 0 16 16">
                                <path d="M3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3zm2.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M5.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M8 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                            </svg>
                        </div>
                        <div className='create-section1 text-center d-flex align-items-center justify-content-center'>
                            <div className="p-2">
                                <h3 className="text-white mb-3">New Here?</h3>
                                <p className="text-white mb-4">
                                    Don’t have an account yet? Create one now and join the conversation!
                                </p>
                                <Link
                                    className="btn btn-outline-light btn-lg create-btn"
                                    href='/Auth/Signup' style={{ textDecoration: "none" }}
                                >
                                    Create New Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;