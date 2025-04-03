import React from 'react'

export default function Dashboard() {
    localStorage.getItem("user", JSON.stringify(response.data));

  return (
    <>
        <h1>Welcome To NexTalk</h1>
        <h2>Hello, {user ? user.name : "Guest"}!</h2> 
    </>
  )
}
