import { Outlet, Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="d-flex">
      <aside className="p-3 bg-light" style={{ width: '250px' }}>
        <h4 className="mb-4">Nextalk</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link" to="/Dashboard">Home</Link>
          </li>
        </ul>
      </aside>

      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
