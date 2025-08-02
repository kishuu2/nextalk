'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import predefine from '../../public/Images/predefine.webp';

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
        marginBottom: '6px'
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
        flexShrink: 0
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

    return (
        <div style={containerStyle}>
            {/* Mobile Chat Header */}
            <div style={headerStyle}>
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

            {/* Mobile Chat Messages */}
            <div style={chatBodyStyle}>
                <div
                    ref={chatContainerRef}
                    style={messagesContainerStyle}
                    onScroll={handleScroll}
                >
                    {/* Mobile Restore Chat Button - Top Position */}
                    {selectedChat && selectedUser && deletedChats.has(`${sessionUserId}_${selectedChat}`) && (
                        <div style={restoreTopSectionStyle}>
                            <button
                                style={restoreTopBtnStyle}
                                onClick={() => handleRestoreChatClick(selectedUser._id, selectedUser.name)}
                            >
                                <i className="bi bi-arrow-clockwise"></i>
                                Restore Chat
                            </button>
                        </div>
                    )}

                    {selectedChat && chatMessages[selectedChat] && chatMessages[selectedChat].length > 0 && !deletedChats.has(`${sessionUserId}_${selectedChat}`) ? (
                        <>
                            {chatMessages[selectedChat].map((msg) => (
                                <div key={msg.id} style={messageWrapperStyle}>
                                    <div style={msg.sender === "You" ? messageSentStyle : messageReceivedStyle}>
                                        <div style={msg.sender === "You" ? messageBubbleSentStyle : messageBubbleReceivedStyle}>
                                            <div style={messageTextStyle}>{msg.text}</div>
                                            <div style={{
                                                ...messageMetaStyle,
                                                justifyContent: msg.sender === "You" ? 'flex-end' : 'flex-start'
                                            }}>
                                                <span>{msg.timestamp}</span>
                                                {msg.sender === "You" && (
                                                    <span style={{
                                                        color: msg.delivered ? '#28a745' : '#6c757d'
                                                    }}>
                                                        {msg.delivered ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Delete Chat Option - Only show delete button at bottom */}
                            {selectedChat && selectedUser && chatMessages[selectedChat] && chatMessages[selectedChat].length > 0 && !deletedChats.has(`${sessionUserId}_${selectedChat}`) && (
                                <div style={deleteActionStyle}>
                                    <button
                                        style={deleteBtnStyle}
                                        onClick={() => handleDeleteChatClick(selectedUser._id, selectedUser.name)}
                                    >
                                        <i className="bi bi-trash3-fill"></i>
                                        Delete Chat
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={emptyStateStyle}>
                            <div>
                                <i className="bi bi-chat-dots" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                                <p style={{ fontSize: '18px', marginBottom: '8px' }}>No messages yet</p>
                                <small style={{ fontSize: '14px', opacity: 0.7 }}>Send a message to start the conversation</small>
                            </div>
                        </div>
                    )}
                </div>

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

            {/* Mobile Chat Input */}
            <div style={chatInputStyle}>
                <form onSubmit={handleSendMessage}>
                    <div style={inputContainerStyle}>
                        <input
                            type="text"
                            style={{
                                ...messageInputStyle,
                                opacity: deletedChats.has(`${sessionUserId}_${selectedUser?._id}`) ? 0.6 : 1
                            }}
                            placeholder={deletedChats.has(`${sessionUserId}_${selectedUser?._id}`) ? "Chat deleted - restore from top to send messages" : "Message..."}
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            disabled={deletedChats.has(`${sessionUserId}_${selectedUser?._id}`)}
                        />

                        <button
                            type="submit"
                            style={{
                                ...sendButtonStyle,
                                opacity: (!newMessage.trim() || deletedChats.has(`${sessionUserId}_${selectedUser?._id}`)) ? 0.6 : 1,
                                cursor: (!newMessage.trim() || deletedChats.has(`${sessionUserId}_${selectedUser?._id}`)) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={!newMessage.trim() || deletedChats.has(`${sessionUserId}_${selectedUser?._id}`)}
                        >
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MobileChatView;
