import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTheme } from '../Components/ThemeContext';
import '../styles/Login.css';
import Head from 'next/head';

function Login() {
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', agree: false });
    const navigate = useRouter();
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        general: '',
    });

    const [success, setSuccess] = useState('');
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const validateEmail = (email) => {
        // Reject if any uppercase letters exist
        const hasUppercase = /[A-Z]/.test(email);
        if (hasUppercase) return false;

        // Proceed with regular email format validation
        const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors('');
        setLoading(true);
        setProgress(10);

        if (!formData.name || !formData.username || !formData.email || !formData.password) {
            setErrors('Please fill in all required fields.');
            setLoading(false)
            return;
        }
        if (!formData.agree) {
            setErrors('Agree to the Terms & Conditions.');
            setLoading(false)
            return;
        }

        const isEmailValid = validateEmail(formData.email);
        if (!isEmailValid) {
            setErrors((prev) => ({
                ...prev,
                email: 'Email must be lowercase and properly formatted',
            }));
            setLoading(false);
            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 80) {
                    clearInterval(interval); // Stop early, wait for real response to complete it
                    return prev;
                }
                return prev + 20;
            });
        }, 200);
        try {
            setLoading(true)
            setProgress(40);
            await axios.post('https://nextalk-u0y1.onrender.com/signup', formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            setProgress(100); // Full
            setSuccess("User registered successfully! 🎉");
            setTimeout(() => {
                navigate('/');
            }, 500);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 409) {
                    const errorMsg = error.response.data.error.toLowerCase();
                    setLoading(false)
                    setErrors((prev) => ({
                        ...prev,
                        username: errorMsg.includes("username") ? "Username already exists. Choose another one." : "",
                        email: errorMsg.includes("email") ? "Email already exists. Use a different one." : "",
                    }));
                } else {
                    // Other server-side error
                    setLoading(false)
                    setErrors((prev) => ({
                        ...prev,
                        general: error.response.data.error || "Registration failed. Please try again.",
                    }));
                }
            } else {
                // Network or unknown error
                setLoading(false)
                setErrors((prev) => ({
                    ...prev,
                    general: "Network error. Please try again.",
                }));
            }
        } finally {
            setLoading(false);
        }

    };

    const { theme, handleThemeClick } = useTheme();
    const videoSrc = {
        homeback: "/Images/download.png",
        homesecond: "/Images/download2.png",
        homethird: "/Images/download3.png",
        homefourth: "/Images/download4.png",
        homefive: "/Images/download5.png",
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
            <Head>
                <title>Create The Account</title>
            </Head>
            <div className="row g-0 shadow-lg login-wrapper">

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
                            <h3 className="text-white mb-3">Already have ?</h3>
                            <p className="text-white mb-4">
                                you have account already? Then let&apos;s get started now clicked the belowed button!
                            </p>
                            <Link
                                className="btn btn-outline-light btn-lg create-btn"
                                href='/Auth/Login' style={{ textDecoration: "none" }}
                            >
                                Already have account!
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Login Section */}
                <div className="col-md-6 login-section">
                    {Object.values(errors).some((msg) => msg) && (
                        <div className="alert alert-danger" role="alert">
                            <strong>Alert! </strong>
                            {Object.values(errors).map(
                                (msg, i) => msg && <span key={i}>{msg}</span>
                            )}
                        </div>
                    )}
                    {errors.general && (
                        <div className="alert alert-danger" role="alert">
                            <strong>Alert!</strong> {errors.general}
                        </div>
                    )}

                    {loading && (
                        <div className="alert alert-success" role="alert">
                            <strong>Loading . . .</strong> {success}
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
                        <h2 className="text-center mb-4 text-primary">Join to NexTalk</h2>
                        <form onSubmit={handleSubmit}>
                            <div className='row'>
                                <div className="mb-3 col-md">
                                    <label htmlFor="name" className="form-label fw-bold">Name</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="name"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3 col-md">
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
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label fw-bold">E-mail</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your e-mail"
                                    value={formData.email}
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
                            <div className="mb-4 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="agree"
                                    name="agree"
                                    checked={formData.agree}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="agree">
                                    I agree to the <Link href="/" className="text-primary">Terms & Conditions</Link>
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg w-100 login-btn">
                                Join now
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;