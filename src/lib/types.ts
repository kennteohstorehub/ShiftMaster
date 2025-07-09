export type Staff = {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  availability: string;
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
