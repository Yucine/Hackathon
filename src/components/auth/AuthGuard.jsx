import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthGuard = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="loading">
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '40px', color: 'var(--mts-red)' }}></i>
        </div>
        <p style={{ color: 'var(--mts-gray)' }}>Загрузка...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;