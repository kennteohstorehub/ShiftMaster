"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Staff, Shift, Role } from '@/lib/types';
import { staff as initialStaff, shifts as initialShifts, roles as initialRoles } from '@/lib/data';
import { generateWeeklyScheduleAction } from '@/app/actions';
import type { GenerateWeeklyScheduleOutput } from '@/ai/flows/generate-weekly-schedule';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  staff: Staff[];
  shifts: Shift[];
  roles: Role[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  addStaff: (staffMember: Omit<Staff, 'id'>) => void;
  updateStaff: (staffMember: Staff) => void;
  deleteStaff: (staffId: string) => void;
  generateSchedule: (options: { customRules?: string, days?: number[] }) => Promise<{ success: boolean; data?: GenerateWeeklyScheduleOutput; error?: string }>;
  addShift: (shift: Omit<Shift, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const addStaff = (staffMember: Omit<Staff, 'id'>) => {
    setStaff(prev => [...prev, { ...staffMember, id: `staff-${Date.now()}` }]);
  };
  
  const updateStaff = (updatedStaff: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };
  
  const deleteStaff = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    // Also remove them from any shifts
    setShifts(prev => prev.filter(s => s.staffId !== staffId));
  };

  const generateSchedule = async (options: { customRules?: string, days?: number[] }) => {
    const daysToGenerate = options.days || [0, 1, 2, 3, 4, 5, 6];
    
    const result = await generateWeeklyScheduleAction({ 
        staff, 
        roles, 
        customRules: options.customRules,
        existingShifts: shifts, 
        daysToGenerate,
    });

    if (result.success && result.data) {
      setShifts(prevShifts => {
        const otherDaysShifts = prevShifts.filter(shift => !daysToGenerate.includes(shift.day));
        return [...otherDaysShifts, ...result.data!.schedule];
      });
    }
    return result;
  }
  
  const addShift = (newShift: Omit<Shift, 'id'>) => {
    setShifts(prev => [...prev, { ...newShift, id: `shift-${uuidv4()}` }]);
  };

  const value = {
    staff,
    shifts,
    roles,
    setShifts,
    addStaff,
    updateStaff,
    deleteStaff,
    generateSchedule,
    addShift,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
