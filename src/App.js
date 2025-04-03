import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './Components/ThemeContext';
import Login from "./Components/Login";
import Signup from "./Components/Signup";

function App() {
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
