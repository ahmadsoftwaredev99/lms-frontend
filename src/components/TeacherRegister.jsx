import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerTeacher, reset } from '../features/auth/authSlice';
import { GraduationCap, UserCheck, ArrowLeft } from 'lucide-react';
import TeacherRegistrationForm from './TeacherRegistrationForm';

const TeacherRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

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

  const handleSubmit = (teacherPayload) => {
    dispatch(reset());
    dispatch(registerTeacher(teacherPayload));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* BRANDING HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(90, 155, 74, 0.15)',
            padding: '1rem',
            borderRadius: '20px',
            marginBottom: '1rem',
            border: '1px solid rgba(90, 155, 74, 0.3)',
          }}
        >
          <GraduationCap size={44} color="#5A9B4A" />
        </div>
        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            margin: 0,
            color: 'var(--accent-primary)',
          }}
        >
          Teacher Registration
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
          Create a new Instructor Account on Learning Management System
        </p>
      </div>

      {/* REGISTRATION CARD */}
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
            <UserCheck size={22} color="var(--accent-primary)" /> Teacher Account Sign Up
          </div>
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>

        <TeacherRegistrationForm
          mode="public"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isError={isError}
          errorMessage={message}
        />

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;
