import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import PlannerSession from './pages/PlannerSession';
import MentorSession from './pages/MentorSession';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <NavLink to="/" className="brand">
          <span>🦀</span> Rust Learning App
        </NavLink>
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/planner">Planner</NavLink>
        <NavLink to="/mentor">Mentor</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<PlannerSession />} />
        <Route path="/planner/:exerciseId" element={<PlannerSession />} />
        <Route path="/mentor" element={<MentorSession />} />
        <Route path="/mentor/:conceptId" element={<MentorSession />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
