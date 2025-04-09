import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from './ThemeContext';
import '../styles/Login.css';
import Random1 from "../Images/download.png";
import Random2 from "../Images/download2.png";
import Random3 from "../Images/download3.png";
import Random4 from "../Images/download4.png";
import Random5 from "../Images/download5.png";


function Login() {
    const [formData, setFormData] = useState({ email: '', otp: '', agree: false });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [emailExists, setEmailExists] = useState(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

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
        setLoading(true);
        setProgress(10);
        setEmailExists(null)
        // Check for required fields
        if (!formData.email) {
            setError('Please fill in all required fields!');
            setLoading(false)
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
        if (!otpSent) {
            try {
                setLoading(true)
                setProgress(30);
                const response = await axios.post('https://nextalk-u0y1.onrender.com/send-otp', {
                    email: formData.email.toLowerCase(), // force lowercase
                });

                setProgress(70);

                setSuccess("We Sent you a OTP on your E-mail!");
                setOtpSent(true);
                setError(null);
            } catch (error) {
                setProgress(0);
                setEmailExists(null);
                if (error.response) {
                    if (error.response.status === 401) {
                        setError('Invalid Username or Password.');
                        setLoading(false)
                    } else {
                        setError(error.response.data.error || 'Login failed. Please try again.');
                        setLoading(false)
                    }
                } else {
                    setError('Network error. Please try again.');
                    setLoading(false)
                }
            } finally {
                setLoading(false);
            }
        }
        else {
            try {
                const response = await axios.post('https://nextalk-u0y1.onrender.com/verify-otp', {
                    email: formData.email,
                    otp: formData.otp
                });
                setSuccess("Authentication success");
            } catch (err) {
                setError(err.response?.data?.error || "OTP verification failed.");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (error) {
            setError("");
        }
    }, [formData.email]);

    useEffect(() => {
        const checkEmail = async () => {
            if (!formData.email) {
                setEmailExists(null);
                return;
            }

            setCheckingEmail(true);

            try {
                const response = await axios.post("https://nextalk-u0y1.onrender.com/check-email", {
                    email: formData.email,
                });

                setEmailExists(response.data.exists); // true/false from backend
            } catch (error) {
                setEmailExists(false); // fallback if error
            } finally {
                setCheckingEmail(false);
            }
        };

        const delayDebounce = setTimeout(() => {
            checkEmail();
        }, 600); // debounce to avoid over-requesting

        return () => clearTimeout(delayDebounce);
    }, [formData.email]);

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
                    {(error || (formData.email && !checkingEmail && emailExists !== null)) && (
                        <div
                            className={`alert ${error
                                ? 'alert-danger'
                                : emailExists === true
                                    ? 'alert-success'
                                    : 'alert-warning'
                                }`}
                            role="alert"
                        >
                            {error && <span>
                                <strong>Alert! </strong>{error}</span>}

                            {!error && emailExists === true && <span>✅ Email exists!</span>}
                            {!error && emailExists === false && <span>❌ This email is not registered.</span>}
                        </div>
                    )}

                    {checkingEmail && formData.email && !error && (
                        <div className="alert alert-secondary" role="alert">
                            <strong>Checking...</strong> ⏳ Checking email...
                        </div>
                    )}


                    {/* Alert Section */}
                    {loading ? (
                        <div className="alert alert-info" role="alert">
                            <strong>Loading . . .</strong>
                            <div className="progress mt-2" style={{ height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                                    role="progressbar"
                                    style={{ width: `${progress}%`, transition: "width 0.3s ease-in-out" }}
                                ></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            <strong>Alert!</strong> {error}
                        </div>
                    ) : success && (
                        <div className="alert alert-success" role="alert">
                            <strong>Success!</strong> {success}
                        </div>
                    )}



                    <div className="card-body">
                        <h2 className="text-center mb-4 text-primary">Forgot password!</h2>
                        <form onSubmit={handleSubmit}>
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
                                <label htmlFor="otp" className="form-label fw-bold">One Time Password</label>
                                <input
                                    type="number"
                                    className="form-control form-control-lg"
                                    id="otp"
                                    name="otp"
                                    placeholder="Enter your OTP"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    disabled={!otpSent}
                                />
                            </div><br /><br />
                            <button
                                type="submit"
                                className="btn btn-primary w-100 login-btn"
                                disabled={!formData.email || checkingEmail || (!otpSent && emailExists !== true)}
                            >
                                {otpSent ? "Continue" : "Send OTP"}
                            </button>
                            <br /><br />
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
                            <h3 className="text-white mb-3">🔐 Remembered password?{' '}</h3>
                            <p className="text-white mb-4">
                                Thought you forgot it? Happens to the best of us 😅.
                                If your memory just clicked back into place, no stress.
                            </p>
                            <button
                                className="btn btn-outline-light btn-lg create-btn"
                                onClick={() => navigate('/')}
                            >
                                Login now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;