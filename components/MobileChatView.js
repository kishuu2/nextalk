'use client';
import { useState, useRef, useEffect } from 'react';

// Animation and responsive CSS (can be moved to a CSS file if desired)
const animationStyles = `
.chat-message-anim {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.35s, transform 0.35s;
}
.chat-message-anim-enter {
  opacity: 0;
  transform: translateY(30px);
}
.chat-message-anim-exit {
  opacity: 0;
  transform: translateY(-30px);
}
@media (min-width: 768px) {
  .chat-main-container {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 16px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.10);
    height: 90vh;
    top: 5vh;
    left: 0; right: 0; bottom: auto;
    position: relative;
  }
  .chat-header {
    border-radius: 16px 16px 0 0;
  }
  .chat-input-bar {
    border-radius: 0 0 16px 16px;
  }
}
`;

if (typeof window !== 'undefined' && !document.getElementById('chat-anim-style')) {
  const style = document.createElement('style');
  style.id = 'chat-anim-style';
  style.innerHTML = animationStyles;
  document.head.appendChild(style);
}
import Image from 'next/image';
import predefine from '../public/Images/predefine.webp'; // Adjust the path as necessary

const MobileChatView = ({
    selectedUser,
    selectedChat,
    chatMessages,
    sessionUserId,
    onlineUsers,
    typingUsers,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleTyping,
    onBack,
    formatLastSeen,
    chatSizes,
    deletedChats,
    restoreChat,
    showScrollToBottom,
    scrollToBottom,
    handleScroll,
    chatContainerRef,
    handleDeleteChatClick,
    handleRestoreChatClick
}) => {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    // Handle keyboard visibility on mobile
    useEffect(() => {
        const handleResize = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.clientHeight;
            setIsKeyboardOpen(windowHeight < documentHeight * 0.75);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#f8f9fa',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050
    };

    const headerStyle = {
        background: '#fff',
        borderBottom: '1px solid #e9ecef',
        padding: '12px 16px',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const headerContentStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const backButtonStyle = {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: '#333',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    };

    const userInfoStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1
    };

    const avatarContainerStyle = {
        position: 'relative'
    };

    const statusDotStyle = {
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '2px solid #fff',
        backgroundColor: onlineUsers?.has?.(selectedUser?._id) ? '#28a745' : '#dc3545'
    };
    const userNameStyle = {
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        color: '#333'
    };
    const userStatusStyle = {
        color: '#6c757d',
        fontSize: '12px'
    };
    const chatBodyStyle = {
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
    };
    const messagesContainerStyle = {
        height: '100%',
        overflowY: 'auto',
        padding: '16px',
        scrollBehavior: 'smooth'
    };
    const restoreTopSectionStyle = {
        textAlign: 'center',
        padding: '16px 20px',
        marginBottom: '20px',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(16, 185, 129, 0.2)'
    };
    const restoreTopBtnStyle = {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    };
    const messageWrapperStyle = {
        marginBottom: '16px'
    };
    const messageSentStyle = {
        display: 'flex',
        width: '100%',
        justifyContent: 'flex-end'
    };
    const messageReceivedStyle = {
        display: 'flex',
        width: '100%',
        justifyContent: 'flex-start'
    };
    const messageBubbleSentStyle = {
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '20px 20px 6px 20px',
        background: '#007bff',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,123,255,0.3)',
        wordWrap: 'break-word'
    };
    const messageBubbleReceivedStyle = {
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '20px 20px 20px 6px',
        background: '#fff',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef',
        wordWrap: 'break-word'
    };
    const messageTextStyle = {
        fontSize: '16px',
        lineHeight: 1.4,
        marginBottom: '6px',
        wordBreak: 'break-word',
        display: 'inline-block',
    };
    // Style for larger emojis
    const emojiStyle = {
        fontSize: '1.5em',
        verticalAlign: 'middle',
        lineHeight: 1.1
    };
    const messageMetaStyle = {
        fontSize: '12px',
        opacity: 0.8,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    };
    const emptyStateStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: '#6c757d'
    };
    const scrollButtonStyle = {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#007bff',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        cursor: 'pointer',
        zIndex: 10
    };
    const chatInputStyle = {
        background: '#fff',
        borderTop: '1px solid #e9ecef',
        padding: '16px',
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 20,
        transition: 'bottom 0.2s',
    };
    const inputContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };
    const messageInputStyle = {
        flex: 1,
        border: '1px solid #e9ecef',
        borderRadius: '25px',
        padding: '12px 16px',
        fontSize: '16px',
        background: '#f8f9fa',
        outline: 'none'
    };
    const sendButtonStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#007bff',
        color: '#fff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        cursor: 'pointer',
        flexShrink: 0
    };
    const deleteActionStyle = {
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        marginTop: '20px'
    };
    const deleteBtnStyle = {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    };
    // Track which messages are animating in/out
    const [animatingMessages, setAnimatingMessages] = useState({});

    // Animate new messages
    useEffect(() => {
        if (!selectedChat || !chatMessages[selectedChat]) return;
        const ids = chatMessages[selectedChat].map((msg, idx) => msg.id || idx);
        setAnimatingMessages((prev) => {
            const next = { ...prev };
            ids.forEach(id => {
                if (!next[id]) next[id] = 'enter';
            });
            // Remove old
            Object.keys(next).forEach(id => {
                if (!ids.includes(id)) delete next[id];
            });
            return next;
        });
        // After a tick, remove 'enter' class
        setTimeout(() => {
            setAnimatingMessages((prev) => {
                const next = { ...prev };
                ids.forEach(id => {
                    if (next[id] === 'enter') next[id] = '';
                });
                return next;
            });
        }, 50);
    }, [chatMessages, selectedChat]);

    // Fade out whole chat on delete (existing logic)
    return (
        <div
            className="chat-main-container"
            style={{...containerStyle, opacity: fadeOut ? 0 : 1, transition: 'opacity 0.35s'}}
        >
            {/* Mobile Chat Header */}
            <div style={headerStyle} className="chat-header">
                <div style={headerContentStyle}>
                    <button
                        style={backButtonStyle}
                        onClick={onBack}
                        aria-label="Back to chat list"
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div style={userInfoStyle}>
                        <div style={avatarContainerStyle}>
                            <Image
                                src={selectedUser?.image || predefine}
                                alt={selectedUser?.name || 'User'}
                                width={40}
                                height={40}
                                style={{ borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={statusDotStyle}></span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h6 style={userNameStyle}>{selectedUser?.name || 'User'}</h6>
                            <small style={userStatusStyle}>
                                {formatLastSeen(
                                    new Date(selectedUser?.lastSeen || Date.now()),
                                    onlineUsers?.has?.(selectedUser?._id) ?? false
                                )}
                            </small>
                        </div>
                        {/* Chat Size Display */}
                        {selectedUser && chatSizes[`${sessionUserId}_${selectedUser._id}`] && (
                            <div style={{ fontSize: '10px' }}>
                                <small style={{
                                    color: chatSizes[`${sessionUserId}_${selectedUser._id}`]?.exceedsLimit ? '#dc3545' : '#6c757d'
                                }}>
                                    {chatSizes[`${sessionUserId}_${selectedUser._id}`]?.sizeFormatted}
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Mobile Chat Messages */}
            {/* Always show Restore Chat Button at the top if deleted */}
            {selectedChat && selectedUser && deletedChats.has(`${sessionUserId}_${selectedChat}`) && (
                <div style={{...restoreTopSectionStyle, position: 'relative', zIndex: 1002}}>
                    <button
                        style={restoreTopBtnStyle}
                        onClick={() => handleRestoreChatClick(selectedUser._id, selectedUser.name)}
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                        Restore Chat
                    </button>
                </div>
            )}
            {/* Only show chat messages section if chat is not deleted */}
            {!deletedChats.has(`${sessionUserId}_${selectedChat}`) && (
                <div style={chatBodyStyle}>
                    <div
                        ref={chatContainerRef}
                        style={messagesContainerStyle}
                        onScroll={handleScroll}
                    >
                        {/* Always render chat history if chat exists in database (including if deletedBy is empty) */}
                        {selectedChat && chatMessages[selectedChat] && chatMessages[selectedChat].length > 0 && (
                            <>
                                {/* Separate restored and normal messages visually */}
                                {(() => {
                                    // Separate restored and normal messages visually, with correct timestamp and alignment
                                    const messages = [...chatMessages[selectedChat]].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                    let restoredSeparatorShown = false;
                                    return messages.map((msg, idx) => {
                                        // Always determine isSent by comparing senderId to sessionUserId (string compare for robustness)
                                        const isSent = String(msg.senderId) === String(sessionUserId);
                                        const messageText = msg.text || msg.message || '';
                                        // Format timestamp to 12-hour format
                                        let formattedTime = '';
                                        if (msg.timestamp) {
                                            const dateObj = new Date(msg.timestamp);
                                            let hours = dateObj.getHours();
                                            const minutes = dateObj.getMinutes();
                                            const ampm = hours >= 12 ? 'PM' : 'AM';
                                            hours = hours % 12;
                                            hours = hours ? hours : 12;
                                            const minutesStr = minutes < 10 ? '0' + minutes : minutes;
                                            formattedTime = `${hours}:${minutesStr} ${ampm}`;
                                        }
                                        const isRestored = msg.restored === true;
                                        // Show a separator above the first restored message
                                        let separator = null;
                                        if (isRestored && !restoredSeparatorShown) {
                                            separator = (
                                                <div key="restored-separator" style={{textAlign:'center',margin:'18px 0 8px 0'}}>
                                                    <span style={{background:'#10b981',color:'#fff',padding:'3px 14px',borderRadius:'16px',fontSize:'13px',fontWeight:600,letterSpacing:'1px'}}>Restored Chat</span>
                                                </div>
                                            );
                                            restoredSeparatorShown = true;
                                        }
                                        return (
                                            <>
                                                {separator}
                                                <div
                                                    key={msg.id || idx}
                                                    style={messageWrapperStyle}
                                                    className={`chat-message-anim${animatingMessages[msg.id || idx] ? ' chat-message-anim-' + animatingMessages[msg.id || idx] : ''}`}
                                                >
                                                    <div style={isSent ? messageSentStyle : messageReceivedStyle}>
                                                        <div style={isSent ? messageBubbleSentStyle : messageBubbleReceivedStyle}>
                                                            <div style={messageTextStyle}>
                                                                {messageText.split(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu).map((part, i) =>
                                                                    /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(part)
                                                                        ? <span key={i} style={emojiStyle}>{part}</span>
                                                                        : part
                                                                )}
                                                            </div>
                                                            <div style={{
                                                                ...messageMetaStyle,
                                                                justifyContent: isSent ? 'flex-end' : 'flex-start'
                                                            }}>
                                                                <span>{formattedTime}</span>
                                                                {isSent && (
                                                                    <span style={{
                                                                        color: msg.delivered ? '#28a745' : '#6c757d',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {msg.delivered ? 'Seen' : 'Sent'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    });
                                })()}
                                {/* Delete Chat Option - Only show delete button at bottom if not deleted */}
                                {selectedChat && selectedUser && chatMessages[selectedChat] && chatMessages[selectedChat].length > 0 && !deletedChats.has(`${sessionUserId}_${selectedChat}`) && (
                                    <div style={{...deleteActionStyle, marginBottom: 90}}>
                                        <button
                                            style={deleteBtnStyle}
                                            onClick={() => {
                                                setFadeOut(true);
                                                setTimeout(() => {
                                                    handleDeleteChatClick(selectedUser._id, selectedUser.name);
                                                    setFadeOut(false);
                                                }, 350);
                                            }}
                                        >
                                            <i className="bi bi-trash3-fill"></i>
                                            Delete Chat
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        {/* Show empty state if no messages */}
                        {selectedChat && (!chatMessages[selectedChat] || chatMessages[selectedChat].length === 0) && (
                            <div style={emptyStateStyle}>
                                <div>
                                    <i className="bi bi-chat-dots" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                                    <p style={{ fontSize: '18px', marginBottom: '8px' }}>No messages yet</p>
                                    <small style={{ fontSize: '14px', opacity: 0.7 }}>Send a message to start the conversation</small>
                                </div>
                            </div>
                        )}
                        {/* Scroll to Bottom Button */}
                        {showScrollToBottom && (
                            <button
                                style={scrollButtonStyle}
                                onClick={scrollToBottom}
                                aria-label="Scroll to bottom"
                            >
                                <i className="bi bi-arrow-down"></i>
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* Mobile Chat Input */}
            {/* Mobile Chat Input - Always visible, fixed above keyboard on mobile */}
            <div
                style={{
                    ...chatInputStyle,
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    width: '100vw',
                    bottom: isKeyboardOpen ? 'env(safe-area-inset-bottom, 0px)' : 0,
                    opacity: fadeOut ? 0.5 : 1,
                    pointerEvents: fadeOut ? 'none' : 'auto',
                    transition: 'opacity 0.35s, bottom 0.2s',
                    zIndex: 1001
                }}
                className="chat-input-bar"
            >
                <form onSubmit={handleSendMessage}>
                    <div style={inputContainerStyle}>
                        <input
                            type="text"
                            style={messageInputStyle}
                            placeholder="Message..."
                            value={newMessage}
                            onFocus={() => setIsKeyboardOpen(true)}
                            onBlur={() => setIsKeyboardOpen(false)}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            disabled={fadeOut}
                        />
                        <button
                            type="submit"
                            style={sendButtonStyle}
                            disabled={!newMessage.trim() || fadeOut}
                        >
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MobileChatView;