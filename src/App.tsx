import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';

// Pages
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import FocusMode from './pages/FocusMode';
import Finance from './pages/Finance';
import Family from './pages/Family';
import Settings from './pages/Settings';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/focus" element={<FocusMode />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/family" element={<Family />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;