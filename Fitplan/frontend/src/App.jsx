import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import TrainerDashboard from './pages/TrainerDashboard';
import PlanDetails from './pages/PlanDetails';
import UserFeed from './pages/UserFeed';
import './index.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="container">
      <div className="nav">
        <Link to="/" className="logo">FitPlanHub</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {user ? (
            <>
              {user.role === 'trainer' && <Link to="/dashboard">Dashboard</Link>}
              {user.role === 'user' && <Link to="/feed">My Feed</Link>}
              <span style={{ marginLeft: '20px', color: '#666' }}>Hello, {user.username}</span>
              <button onClick={logout} className="btn" style={{ background: 'transparent', color: '#aaa', marginLeft: '10px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <PrivateRoute role="trainer">
              <TrainerDashboard />
            </PrivateRoute>
          } />

          <Route path="/feed" element={
            <PrivateRoute role="user">
              <UserFeed />
            </PrivateRoute>
          } />

          <Route path="/plan/:id" element={<PlanDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
