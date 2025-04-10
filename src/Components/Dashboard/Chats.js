// Chats.jsx
import { useState } from "react";
import { useTheme } from '../ThemeContext';
import "../../styles/Chats.css";

export default function Chats() {
    const { theme } = useTheme();
    const [messages, setMessages] = useState([
        { id: 1, sender: "You", text: "Hey, how's it going?", timestamp: "10:30 AM" },
        { id: 2, sender: "Friend", text: "Pretty good, thanks! You?", timestamp: "10:32 AM" },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return { 
                background: '#1e293b', 
                color: '#e2e8f0', 
                inputBg: '#334155', 
                inputColor: '#e2e8f0',
                messageBgYou: '#3b82f6',
                messageBgFriend: '#4b5563'
            };
        }
        // Default to light styles for 'homeback' or any other theme
        return { 
            background: '#ffffff', 
            color: '#1e293b', 
            inputBg: '#f1f5f9', 
            inputColor: '#1e293b',
            messageBgYou: '#3b82f6',
            messageBgFriend: '#e5e7eb'
        };
    };

    const currentThemeStyles = getThemeStyles();

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const newMsg = {
                id: messages.length + 1,
                sender: "You",
                text: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([...messages, newMsg]);
            setNewMessage("");
        }
    };

    return (
        <div 
            className="chat-wrapper" 
            style={{ 
                background: currentThemeStyles.background, 
                color: currentThemeStyles.color 
            }}
        >
            <div className="chat-header">
                <h2 className="chat-title">Chats</h2>
            </div>
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`message ${msg.sender === "You" ? "message-you" : "message-friend"}`}
                    >
                        <div 
                            className="message-bubble"
                            style={{ 
                                background: msg.sender === "You" 
                                    ? currentThemeStyles.messageBgYou 
                                    : currentThemeStyles.messageBgFriend,
                                color: msg.sender === "You" ? '#ffffff' : currentThemeStyles.color
                            }}
                        >
                            <span className="message-text">{msg.text}</span>
                            <span className="message-timestamp">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ 
                        background: currentThemeStyles.inputBg, 
                        color: currentThemeStyles.inputColor 
                    }}
                />
                <button type="submit" className="chat-send-btn">
                    <i className="bi bi-send-fill"></i>
                </button>
            </form>
        </div>
    );
}