import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, register, reset } from '../features/auth/authSlice';
import { GraduationCap, Lock, Mail, LogIn, UserPlus } from 'lucide-react';
import StudentRegistrationForm from './StudentRegistrationForm';

const LoginRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  const [isLoginView, setIsLoginView] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'teacher':
          navigate('/teacher', { replace: true });
          break;
        case 'student':
          navigate('/student', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(reset());
    dispatch(login({ email: loginData.email, password: loginData.password }));
  };

  const handleRegisterSubmit = (studentPayload) => {
    dispatch(reset());
    dispatch(register(studentPayload));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
      
      {/* BRANDING HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(90, 155, 74, 0.15)', padding: '1rem', borderRadius: '20px', marginBottom: '1rem', border: '1px solid rgba(90, 155, 74, 0.3)' }}>
          <GraduationCap size={44} color="#5A9B4A" />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--accent-primary)' }}>
          Learning Management System
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
          Unified Access Portal for Students, Teachers & Administrators
        </p>
      </div>

      {/* LOGIN / REGISTER CARD */}
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.25rem' }}>
        
        {/* TAB TOGGLE: LOGIN VS REGISTER */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '0.35rem', marginBottom: '1.75rem' }}>
          <button
            onClick={() => {
              dispatch(reset());
              setIsLoginView(true);
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: isLoginView ? 'var(--accent-gradient)' : 'transparent',
              color: isLoginView ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <LogIn size={18} /> Sign In
          </button>
          <button
            onClick={() => {
              dispatch(reset());
              setIsLoginView(false);
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: !isLoginView ? 'var(--accent-gradient)' : 'transparent',
              color: !isLoginView ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={18} /> Register Student
          </button>
        </div>

        {isLoginView ? (
          <div>
            {/* ERROR NOTIFICATION BANNER */}
            {isError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                {message || 'Authentication error. Please check your credentials.'}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter email address (e.g. user@example.com)"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          <StudentRegistrationForm
            mode="public"
            onSubmit={handleRegisterSubmit}
            isLoading={isLoading}
            isError={isError}
            errorMessage={message}
          />
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Are you an instructor?{' '}
          <Link to="/register/teacher" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register as Teacher
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
