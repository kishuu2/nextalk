// pages/_app.js
import { ThemeProvider } from '../context/ThemeContext';
import "../pages/styles/Login.css";
import "../pages/styles/Home.css";
import "../pages/styles/DashboardLayout.css";
import "../pages/styles/globals.css";
import "../pages/styles/Profile.css";
import "../pages/styles/Chats.css";
import "../pages/styles/Messages.css";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
