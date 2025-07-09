export type LeaveType = 'sick' | 'vacation' | 'medical' | 'personal' | 'emergency' | 'maternity' | 'paternity';

export type LeaveRequest = {
  id: string;
  staffId: string;
  type: LeaveType;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  notes?: string;
};

export type StaffAvailability = {
  // General availability preferences
  preferredDays?: number[]; // 0-6 for Sun-Sat
  preferredShifts?: string[]; // ["09:00-18:00", "11:00-20:00", "12:00-21:00"]
  unavailableDays?: number[]; // Days they can't work
  notes?: string;
  
  // Specific date unavailability (for leave)
  unavailableDates?: string[]; // ISO date strings
};

export type Staff = {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  availability: string; // Keep for backward compatibility
  detailedAvailability?: StaffAvailability; // New structured availability
  currentLeaves?: LeaveRequest[]; // Active leave requests
};

export type Role = {
  id: string;
  name: string;
  requiredAgents: number; // Number of agents required per hour
};

export type Shift = {
  id: string;
  day: number; // 0-6 for Sun-Sat
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  roleId: string;
  staffId: string; // staffId is now required for a generated shift
};

export type ScheduleWeek = {
  startDate: string; // ISO date string of the Monday
  endDate: string; // ISO date string of the Sunday
  shifts: Shift[];
  leaveRequests: LeaveRequest[];
};
