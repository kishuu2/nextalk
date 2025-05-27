import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from '../axiosConfig';
import { useTheme } from '../../context/ThemeContext';
import Head from 'next/head';

function Login() {
    const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    const navigate = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [emailExists, setEmailExists] = useState(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

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
                setOtpVerified(true);
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
}, [formData.email, error]);


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

    const handlePasswordUpdate = async () => {
        setError('');
        setSuccess('');
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post('https://nextalk-u0y1.onrender.com/update-password', {
                email: formData.email,
                newPassword: formData.newPassword,
            });

            setSuccess("Password updated successfully. You can now log in!");
            setTimeout(() => {
                navigate("/"); // or your login route
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update password.");
        }
    }

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
    const currentTheme = themeKeys.includes(theme) ? theme : 'homeback';

    const ChangeColor = () => {
        const randomIndex = Math.floor(Math.random() * themeKeys.length);
        const randomTheme = themeKeys[randomIndex];
        handleThemeClick(randomTheme); // Update theme via context
    };


    return (
        <div className="login-container">
            <Head>
                <title>Forgot Password</title>
            </Head>
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
                            <div className="mt-2 progress-line-wrapper">
                                <div className="progress-line"></div>
                            </div>
                        </div>
                    )}



                    <div className="card-body">
                        <h2 className="text-center mb-4 text-primary">Forgot password!</h2>
                        <form onSubmit={handleSubmit}>
                            {!otpVerified ? (
                                <>
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
                                </>) : (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="newPassword" className="form-label fw-bold">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label fw-bold">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                        />
                                    </div><br /><br />

                                    <button
                                        type="button"
                                        className="btn btn-success w-100 login-btn"
                                        onClick={handlePasswordUpdate}
                                    >
                                        Update Password
                                    </button>
                                </>
                            )}
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

                    <div className="rand" onClick={ChangeColor} style={{ zIndex: 3, position: "absolute", top: "20px", right: "20px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-dice-5-fill" viewBox="0 0 16 16">
                            <path d="M3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3zm2.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M5.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M8 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                        </svg></div>
                    <div className='create-section1 text-center d-flex align-items-center justify-content-center'>
                        <div className="p-2">
                            <h3 className="text-white mb-3">Remembered password ?{' '}</h3>
                            <p className="text-white mb-4">
                                Thought you forgot it? Happens to the best of us 😅.
                                If your memory just clicked back into place, no stress.
                            </p>
                            <Link
                                className="btn btn-outline-light btn-lg create-btn"
                                href='/Auth/Login' style={{ textDecoration: "none" }}
                            >
                                Login now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;