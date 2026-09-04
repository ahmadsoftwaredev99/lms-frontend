import React, { useState } from 'react';
import TeacherSidebar from './TeacherSidebar';
import AssignmentsTeacher from './AssignmentsTeacher';
import AttendanceTeacher from './AttendanceTeacher';
import TeacherMaterials from './TeacherMaterials';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="admin-layout">
      <TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'attendance' && <AttendanceTeacher />}
        {activeTab === 'assignments' && <AssignmentsTeacher />}
        {activeTab === 'material' && <TeacherMaterials />}
      </main>
    </div>
  );
};

export default TeacherDashboard;
