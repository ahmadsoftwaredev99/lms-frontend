import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import coursesReducer from '../features/courses/coursesSlice';
import teachersReducer from '../features/teachers/teachersSlice';
import studentsReducer from '../features/students/studentsSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import assignmentsReducer from '../features/assignments/assignmentsSlice';
import profileReducer from '../features/profile/profileSlice';
import studentAssignmentsReducer from '../features/assignments/studentAssignmentsSlice';
import materialReducer from '../features/material/materialSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    teachers: teachersReducer,
    students: studentsReducer,
    attendance: attendanceReducer,
    assignments: assignmentsReducer,
    material: materialReducer,
    profile: profileReducer,
    studentAssignments: studentAssignmentsReducer,
  },
});
