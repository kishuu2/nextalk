import React from 'react'

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
        <h1>Welcome To NexTalk</h1>
        <h2>Hello, {user ? user.name : "Guest"}!</h2> 
    </>
  )
}
