import { useState, useEffect } from "react";
import axios from '../../utils/axiosConfig';
import Image from "next/image";
import predefine from "../../public/Images/predefine.webp";
import DashboardLayout from '../Components/DashboardLayout';
import { useRouter } from 'next/router';

export default function Messages() {
    const [users, setUsers] = useState([]);
    const [sessionUser, setSessionUser] = useState(null);
    const [following, setFollowing] = useState(new Set());
    const [accepted, setAccepted] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const router = useRouter();

    // Mock last message data and reactions
    const [lastMessages, setLastMessages] = useState({});
    const [reactions, setReactions] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = JSON.parse(sessionStorage.getItem('user'));
            const sessionId = storedUser?.user?.id;

            if (!sessionId) {
                setError('No session found.');
                setLoading(false);
                return;
            }

            try {
                // Fetch all users
                const response = await axios.post(
                    'https://nextalk-u0y1.onrender.com/displayusersProfile',
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    }
                );

                const personally = response.data;
                const filteredUsers = personally.filter(user => user._id !== sessionId);
                const sessionUser = personally.find(user => user._id === sessionId);
                setSessionUser(sessionUser);

                // Fetch follow status
                const followRes = await fetch(`https://nextalk-jouy.vercel.app/follow-status/${sessionId}`);
                const followData = await followRes.json();
                setFollowing(new Set(followData.following));
                setAccepted(new Set(followData.accepted));

                // Mock last messages and reactions
                const mockLastMessages = filteredUsers.reduce((acc, user) => ({
                    ...acc,
                    [user._id]: user.lastMessage || `Hey, what's up? ${new Date().toLocaleTimeString()}`,
                }), {});
                const mockReactions = filteredUsers.reduce((acc, user) => ({
                    ...acc,
                    [user._id]: user.reaction || (Math.random() > 0.5 ? '❤️' : null),
                }), {});
                setLastMessages(mockLastMessages);
                setReactions(mockReactions);

                setUsers(filteredUsers);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching data:', err);
                setError('Failed to load data.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter users based on search query and online status
    const filteredUsers = users
        .filter(user => accepted.has(user._id))
        .filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(user => 
            showOnlineOnly ? user.isOnline : true
        );

    return (
        <DashboardLayout>
            {loading ? (
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
            ) : error ? (
                <div className="error">{error}</div>
            ) : filteredUsers.length === 0 ? (
                <div className="no-friends">No friends to message.</div>
            ) : (
                <div className="chat-list">
                    {filteredUsers.map(user => (
                        <div
                            key={user._id}
                            className="chat-item"
                            //onClick={() => router.push(`/messages/${user._id}`)}
                        >
                            <Image
                                src={user.image || predefine}
                                alt={user.name}
                                width={50}
                                height={50}
                                className="image-item sleek-avatar"
                            />
                            <div className="chat-info">
                                <div className="chat-header">
                                    <span className="friend-name">{user.name}</span>
                                    <span className="timestamp">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="last-message-wrapper">
                                    <p className="last-message">
                                        {lastMessages[user._id] || 'No messages yet'}
                                    </p>
                                    {reactions[user._id] && (
                                        <span className="reaction">{reactions[user._id]}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}