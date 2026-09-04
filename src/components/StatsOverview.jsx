import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Users, UserCheck, Activity } from 'lucide-react';

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
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', margin: 0 }}>System Analytics Overview</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Real-time statistics across the LMS platform</p>
        </div>
        <div style={{ background: '#DCFCE7', padding: '0.5rem 0.85rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #86EFAC' }}>
          <Activity size={18} color="#16A34A" />
          <span style={{ fontWeight: 600, color: '#166534', fontSize: '0.85rem' }}>Live Metrics</span>
        </div>
      </div>

      <div className="grid-cols-3">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(90, 155, 74, 0.15)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(90, 155, 74, 0.3)' }}>
            <BookOpen size={32} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Courses</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{loading ? '...' : stats.totalCourses}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
            <Users size={32} color="var(--accent-orange)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Teachers</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{loading ? '...' : stats.totalTeachers}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(90, 155, 74, 0.15)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(90, 155, 74, 0.3)' }}>
            <UserCheck size={32} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Students</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{loading ? '...' : stats.totalStudents}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
