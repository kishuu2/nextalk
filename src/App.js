// App.js
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './Components/ThemeContext';
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import Forgot from "./Components/Auth/Forgot";
import DashboardLayout from "./Components/Dashboard/DashboardLayout";
import Home from "./Components/Dashboard/Home";
import Chats from "./Components/Dashboard/Chats";
import Contacts from "./Components/Dashboard/Contacts"; // Add this
import Settings from "./Components/Dashboard/Settings"; // Add this
import Profile from "./Components/Dashboard/Profile";

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} />

          <Route path="/dashboard/*" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="chats" element={<Chats />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;