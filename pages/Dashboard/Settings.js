//import { useState, useEffect, useRef } from 'react';
//import { useRouter } from 'next/navigation';
//import { useTheme } from '../Components/ThemeContext';
//import axios from '../axiosConfig';
//import predefine from "../../public/Images/predefine.webp";
import "../styles/Profile.css";
import DashboardLayout from '../Components/DashboardLayout';
import Head from 'next/head';

export default function Settings() {
    

    //if (loading) return <div className="loading" aria-label="Loading" >Loading Data</div>;
    //if (error) return <div className="error">{error}</div>;
    const handleNavigateToNotifications = () => {
        router.push('/notifications'); // Placeholder route for notifications
    };

    return (
        <div>
            <DashboardLayout>
                <Head>
                    <title>Settings</title>
                </Head>
                <div className="edit-profile-side">
                    <h2 className="sidebar-title">Settings</h2>
                    <div className="sidebar-section">
                        <h3 className="sidebar-section-title">How to use Nextalk</h3>
                        <p className="sidebar-section-content">
                            Nextalk allows you to connect with friends, share updates, and explore communities.
                            Update your profile to let others know more about you, and manage your notifications
                            to stay updated on what matters most.
                        </p>
                    </div>
                    <div className="sidebar-buttons">
                        <button className="sidebar-button" disabled style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                            <i className="bi bi-person-circle" style={{ fontSize: "24px" }}></i> Edit Profile
                        </button>
                        <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                            <i className="bi bi-qr-code" style={{ fontSize: "24px" }}></i> QR Code
                        </button>
                        <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                            <i className="bi bi-bell" style={{ fontSize: "24px" }}></i> Notifications
                        </button>
                    </div><br />

                    <div>
                        <div className="sidebar-section">
                            <h3 className="sidebar-section-title">Your app and media</h3>
                            <div className="sidebar-buttons">
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                                    <i className="bi bi-translate" style={{ fontSize: "24px" }}></i> Language
                                </button>
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                                    <i className="bi bi-laptop" style={{ fontSize: "24px" }}></i> Website permissions
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="sidebar-section">
                            <h3 className="sidebar-section-title">More info and support</h3>
                            <div className="sidebar-buttons">
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                                    <i className="bi bi-patch-question" style={{ fontSize: "24px" }}></i> Help
                                </button>
                                <button className="sidebar-button" style={{ alignItems: "center", display: "flex", gap: "8px" }} onClick={handleNavigateToNotifications}>
                                    <i className="bi bi-shield-plus" style={{ fontSize: "24px" }}></i> Privacy Center
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </div>
    )
}
