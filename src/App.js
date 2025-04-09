import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './Components/ThemeContext';
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import Forgot from "./Components/Auth/Forgot";
import DashboardLayout from "./Components/Dashboard/DashboardLayout";
import Home from "./Components/Dashboard/Home";

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
