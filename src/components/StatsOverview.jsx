import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Users, UserCheck, Activity, TrendingUp } from 'lucide-react';

const StatsOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ totalCourses: 0, totalTeachers: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch system stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchStats();
    }
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER BANNER */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>System Analytics Overview</h2>
          <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0 0', fontSize: '0.92rem' }}>Real-time statistics across the LMS platform</p>
        </div>
        <div style={{ background: '#EDE9FE', padding: '0.5rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #DDD6FE' }}>
          <Activity size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>Live Metrics</span>
        </div>
      </div>

      {/* STAT CARDS ROW (Alternating Lavender & White like Nexus Dashboard) */}
      <div className="grid-cols-3">
        {/* Card 1: Lavender emphasis card */}
        <div className="stat-card-lavender">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.12)' }}>
              <BookOpen size={30} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total Courses</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink)' }}>{loading ? '...' : stats.totalCourses}</div>
            </div>
          </div>
          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', fontWeight: 700 }}>
            <TrendingUp size={16} /> Active
          </div>
        </div>

        {/* Card 2: Crisp white card */}
        <div className="stat-card-white">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <Users size={30} color="#7C3AED" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total Teachers</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink)' }}>{loading ? '...' : stats.totalTeachers}</div>
            </div>
          </div>
          <div style={{ color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', fontWeight: 700 }}>
            <TrendingUp size={16} /> Faculty
          </div>
        </div>

        {/* Card 3: Lavender emphasis card */}
        <div className="stat-card-lavender">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.12)' }}>
              <UserCheck size={30} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total Students</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ink)' }}>{loading ? '...' : stats.totalStudents}</div>
            </div>
          </div>
          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', fontWeight: 700 }}>
            <TrendingUp size={16} /> Enrolled
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
