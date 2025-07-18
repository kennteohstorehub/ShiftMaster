"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Staff, Shift, Role, LeaveRequest } from '@/lib/types';
import { generateWeeklyScheduleAction } from '@/app/actions';
import type { GenerateWeeklyScheduleOutput } from '@/ai/flows/generate-weekly-schedule';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  staff: Staff[];
  shifts: Shift[];
  roles: Role[];
  leaveRequests: LeaveRequest[];
  loading: boolean;
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  addStaff: (staffMember: Omit<Staff, 'id'>) => Promise<void>;
  updateStaff: (staffMember: Staff) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<void>;
  generateSchedule: (options: { customRules?: string, days?: number[], leaveRequests?: LeaveRequest[], weekStartDate?: string }) => Promise<{ success: boolean; data?: GenerateWeeklyScheduleOutput; error?: string }>;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [staffRes, rolesRes, leaveRequestsRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/roles'),
        fetch('/api/leave-requests'),
      ]);

      if (!staffRes.ok || !rolesRes.ok || !leaveRequestsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [staffData, rolesData, leaveRequestsData] = await Promise.all([
        staffRes.json(),
        rolesRes.json(),
        leaveRequestsRes.json(),
      ]);

      // Transform data to match our types
      setStaff(staffData.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        skills: s.skills,
        availability: s.availability,
        workingDays: s.workingDays,
      })));

      setRoles(rolesData.map((r: any) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        staffNeeded: r.staffNeeded,
      })));

      setLeaveRequests(leaveRequestsData.map((lr: any) => ({
        id: lr.id,
        staffId: lr.staffId,
        staffName: lr.staff?.name || '',
        startDate: lr.startDate,
        endDate: lr.endDate,
        type: lr.type.toLowerCase(),
        reason: lr.reason,
        status: lr.status.toLowerCase(),
      })));

      // Fetch current week shifts
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

      const shiftsRes = await fetch(
        `/api/shifts?startDate=${currentWeekStart.toISOString()}&endDate=${currentWeekEnd.toISOString()}`
      );

      if (shiftsRes.ok) {
        const shiftsData = await shiftsRes.json();
        setShifts(shiftsData.map((s: any) => ({
          id: s.id,
          day: new Date(s.date).getDay(),
          startTime: s.startTime,
          endTime: s.endTime,
          role: s.role.name,
          staffId: s.staffId,
          staffName: s.staff.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addStaff = async (staffMember: Omit<Staff, 'id'>) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffMember),
      });

      if (!res.ok) throw new Error('Failed to add staff');

      const newStaff = await res.json();
      setStaff(prev => [...prev, {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        skills: newStaff.skills,
        availability: newStaff.availability,
        workingDays: newStaff.workingDays,
      }]);

      toast({
        title: 'Success',
        description: 'Staff member added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add staff member',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateStaff = async (updatedStaff: Staff) => {
    try {
      const res = await fetch(`/api/staff/${updatedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStaff),
      });

      if (!res.ok) throw new Error('Failed to update staff');

      setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));

      toast({
        title: 'Success',
        description: 'Staff member updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update staff member',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteStaff = async (staffId: string) => {
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete staff');

      setStaff(prev => prev.filter(s => s.id !== staffId));
      setShifts(prev => prev.filter(s => s.staffId !== staffId));

      toast({
        title: 'Success',
        description: 'Staff member deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete staff member',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const generateSchedule = async (options: { customRules?: string, days?: number[], leaveRequests?: LeaveRequest[], weekStartDate?: string }) => {
    const daysToGenerate = options.days || [0, 1, 2, 3, 4, 5, 6];
    
    const result = await generateWeeklyScheduleAction({ 
        staff, 
        roles, 
        customRules: options.customRules,
        existingShifts: shifts, 
        daysToGenerate,
        leaveRequests: options.leaveRequests || leaveRequests,
        weekStartDate: options.weekStartDate,
    });

    if (result.success && result.data) {
      // Convert generated shifts to database format and save
      const weekStartDate = options.weekStartDate ? new Date(options.weekStartDate) : new Date();
      weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());

      const shiftsToCreate = result.data.schedule.map(shift => {
        const shiftDate = new Date(weekStartDate);
        shiftDate.setDate(shiftDate.getDate() + shift.day);
        
        const role = roles.find(r => r.name === shift.role);
        
        return {
          date: shiftDate.toISOString(),
          startTime: shift.startTime,
          endTime: shift.endTime,
          staffId: shift.staffId,
          roleId: role?.id || '',
        };
      });

      try {
        const res = await fetch('/api/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shiftsToCreate),
        });

        if (!res.ok) throw new Error('Failed to save shifts');

        setShifts(prevShifts => {
          const otherDaysShifts = prevShifts.filter(shift => !daysToGenerate.includes(shift.day));
          return [...otherDaysShifts, ...result.data!.schedule];
        });

        toast({
          title: 'Success',
          description: 'Schedule generated and saved successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save generated schedule',
          variant: 'destructive',
        });
      }
    }
    return result;
  }
  
  const addShift = async (newShift: Omit<Shift, 'id'>) => {
    try {
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      const shiftDate = new Date(currentWeekStart);
      shiftDate.setDate(shiftDate.getDate() + newShift.day);

      const role = roles.find(r => r.name === newShift.role);
      
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: shiftDate.toISOString(),
          startTime: newShift.startTime,
          endTime: newShift.endTime,
          staffId: newShift.staffId,
          roleId: role?.id || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to add shift');

      const createdShift = await res.json();
      setShifts(prev => [...prev, { 
        ...newShift, 
        id: createdShift.id 
      }]);

      toast({
        title: 'Success',
        description: 'Shift added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add shift',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  const value = {
    staff,
    shifts,
    roles,
    leaveRequests,
    loading,
    setShifts,
    addStaff,
    updateStaff,
    deleteStaff,
    generateSchedule,
    addShift,
    refreshData,
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