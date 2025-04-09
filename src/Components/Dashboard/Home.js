import React from 'react'

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <div className="row">
        <div className="col-md">
          <div className='p-2'>
            <div >
              <h2 style={{fontFamily:'monospace'}}>N e x T a l k</h2>
            </div><br/>
            <div>
            </div>
          </div>
        </div>
        <div className="col-md">
          <h2>Hello, {user ? user.name : "Guest"}!</h2>
        </div>
      </div>
    </>
  )
}
