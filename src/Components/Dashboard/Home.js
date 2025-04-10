import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
    }
  }, [navigate]);
  
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed.user); // 👈 only storing inner user object in state
      } catch (err) {
        console.error("Error parsing sessionStorage user:", err);
      }
    }
  }, []);

  return (
    <>
      <div className="row w-100">
        <div className="col-md p-4">
          <h2>Hello, {user?.name || "Guest"}!</h2>
        </div>
      </div>
    </>
  )
}
