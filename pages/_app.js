// pages/_app.js
import { ThemeProvider } from '../context/ThemeContext';
import "../pages/styles/Login.css";
import "../pages/styles/Home.css";
import "../pages/styles/DashboardLayout.css";
import "../pages/styles/globals.css";
import "../pages/styles/Profile.css";
import "../pages/styles/Chats.css";
import "../pages/styles/Messages.css";
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    
    <ThemeProvider>
      <Head>
        <title>Nextalk - Chat Smarter</title>
        <meta name="description" content="Nextalk is a real-time modern chat app built for speed and simplicity." />
        <meta property="og:title" content="Nextalk - Real-Time Chat App" />
        <meta property="og:description" content="Connect, chat and vibe. Fast, private and fun messaging — just like it should be." />
        <meta property="og:image" content="https://nextalk-jouy.vercel.app/logo.jpg" />
        <meta property="og:url" content="https://nextalk-jouy.vercel.app/" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nextalk - Real-Time Chat App" />
        <meta name="twitter:description" content="Connect and chat instantly with Nextalk. Lightweight, real-time messaging." />
        <meta name="twitter:image" content="https://nextalk-jouy.vercel.app/og-image.png" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
