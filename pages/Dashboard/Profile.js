import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import axios from '../../utils/axiosConfig';
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
        followersCount: 250,
        followingCount: 180,
    });
    const [filteredFollowers, setFilteredFollowers] = useState([]);
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

    // if (error) return <div className="error">{error}</div>;
    const [users, setUsers] = useState([]);
    const [visibleUsers, setVisibleUsers] = useState([]); // shown on screen
    const [sessionUserId, setSessionUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayCount, setDisplayCount] = useState(6); // how many to show


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

                const allUsers = response.data.filter(user => user._id !== sessionId);
                setUsers(allUsers);
                setVisibleUsers(allUsers.slice(0, 6)); // first 6
                setTimeout(() => setLoading(false), 1000); // optional fake delay
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);


    useEffect(() => {
        if (!profile || !Array.isArray(profile.followers)) return;

        // Extract follower user IDs from the populated followers array
        const followersArray = profile.followers.map(f => f._id?.toString());
        console.log("Follower IDs extracted:", followersArray);

        // Filter only users who are followers
        const followedUsers = users.filter(user =>
            followersArray.includes(user._id?.toString())
        );

        // Filter for search
        const filtered = followedUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredFollowers(filtered); // useful for Load More check

        // Control visible users based on search or default count
        if (searchTerm.trim() === '') {
            setVisibleUsers(followedUsers.slice(0, displayCount));
        } else {
            setVisibleUsers(filtered.slice(0, displayCount));
        }

    }, [searchTerm, users, displayCount, profile]);






    const handleLoadMore = () => {
        const prevCount = displayCount;
        const newCount = prevCount + 6;
        setDisplayCount(newCount);

        // Scroll to the previous 6th user (after DOM update)
        setTimeout(() => {
            const userElems = document.querySelectorAll(".user-result");
            if (userElems[prevCount]) {
                userElems[prevCount].scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }, 100); // wait a moment for new DOM elements to render
    };

    const handleRemoveFollower = async (followerId) => {
        console.log(followerId);
        try {
            // Optimistically update UI
            setVisibleUsers(prev => prev.filter(user => user._id !== followerId));
            setUsers(prev => prev.filter(user => user._id !== followerId));
            setProfile(prev => ({
                ...prev,
                followers: prev.followers.filter(id => id !== followerId),
                followersCount: prev.followersCount - 1
            }));

            const userId = JSON.parse(sessionStorage.getItem("user"))?.user?.id; // client-side ID
            const response = await axios.delete(
                `https://nextalk-u0y1.onrender.com/removeFollower/${userId}/${followerId}` // pass both IDs directly
            );

            console.log('Unfollowed successfully', response.data);
        } catch (err) {
            console.error("Error removing follower:", err);
        }
    };


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
                                        <div style={{ cursor: "pointer" }} data-bs-toggle="modal" data-bs-target="#followers"><span className="stat-value">{profile.followersCount || "0"}</span><p className="stat-label">Followers</p></div>
                                        <div><span className="stat-value">{profile.followingCount || "0"}</span><p className="stat-label">Following</p></div>
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
            <div className="modal" id="followers">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className='d-flex justify-content-between'>
                            <div>
                                <h5>Followers</h5>
                            </div>
                            <div>
                                <button type="button" className="btn-close bg-primary" data-bs-dismiss="modal"></button>
                            </div>
                        </div><hr />
                        <div className="">
                            <div>
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
                                        <>
                                            {visibleUsers.length > 0 ? (
                                                visibleUsers.map(user => (
                                                    <div key={user._id} className='d-flex align-items-center mb-2 p-2 rounded user-result' style={{ justifyContent: "space-between" }}>
                                                        <div
                                                            className="d-flex gap-4 align-items-center"
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
                                                        <div>
                                                            <button
                                                                className='btn btn-danger btn-sm'
                                                                onClick={() => handleRemoveFollower(user._id)}
                                                            >
                                                                Unfollow
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No more Followers</p>
                                            )}
                                            {/* Show "Load More" button only if there are more followed users to show */}
                                            {visibleUsers.length < filteredFollowers.length && (
                                                searchTerm.trim() === ''
                                                    ? (profile.followers.length || 0)
                                                    : users.filter(user =>
                                                        profile.followers.includes(user._id) &&
                                                        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    ).length
                                            ) && (
                                                    <div className="text-center mt-3">
                                                        <button className="btn w-100 btn-outline-primary" onClick={handleLoadMore}>
                                                            Load More
                                                        </button>
                                                    </div>
                                                )}


                                        </>


                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}