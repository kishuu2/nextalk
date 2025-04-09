import './App.css';
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './Components/ThemeContext';
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Dashboard from './Components/Dashboard';
import Forgot from './Components/Forgot';

function App() {
  return (
    <>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route index element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/Forgot" element={<Forgot />} />
            <Route path="/Dashboard" element={<Dashboard />} />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
