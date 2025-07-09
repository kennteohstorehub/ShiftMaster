'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Trash2, Plus, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Staff, LeaveRequest, LeaveType } from '@/lib/types';

interface LeaveManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff[];
  currentWeekStart: Date;
  onLeaveRequestsChange: (requests: LeaveRequest[]) => void;
  existingLeaveRequests: LeaveRequest[];
}

const leaveTypeColors: Record<LeaveType, string> = {
  sick: 'bg-red-100 text-red-800 border-red-200',
  vacation: 'bg-blue-100 text-blue-800 border-blue-200',
  medical: 'bg-purple-100 text-purple-800 border-purple-200',
  personal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  emergency: 'bg-orange-100 text-orange-800 border-orange-200',
  maternity: 'bg-pink-100 text-pink-800 border-pink-200',
  paternity: 'bg-green-100 text-green-800 border-green-200',
};

const leaveTypeLabels: Record<LeaveType, string> = {
  sick: 'Sick Leave',
  vacation: 'Vacation',
  medical: 'Medical Leave',
  personal: 'Personal Leave',
  emergency: 'Emergency Leave',
  maternity: 'Maternity Leave',
  paternity: 'Paternity Leave',
};

export function LeaveManagementDialog({ 
  open, 
  onOpenChange, 
  staff, 
  currentWeekStart,
  onLeaveRequestsChange,
  existingLeaveRequests 
}: LeaveManagementDialogProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [leaveType, setLeaveType] = useState<LeaveType>('sick');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekStart = startOfWeek(currentWeekStart);
  const weekEnd = endOfWeek(currentWeekStart);

  // Filter leave requests for current week
  const currentWeekLeaves = existingLeaveRequests.filter(leave => {
    const leaveStart = parseISO(leave.startDate);
    const leaveEnd = parseISO(leave.endDate);
    return isWithinInterval(leaveStart, { start: weekStart, end: weekEnd }) ||
           isWithinInterval(leaveEnd, { start: weekStart, end: weekEnd }) ||
           (leaveStart <= weekStart && leaveEnd >= weekEnd);
  });

  const handleCreateLeave = async () => {
    if (!selectedStaff || !startDate || !endDate) return;

    setIsSubmitting(true);
    
    const newLeaveRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      staffId: selectedStaff,
      type: leaveType,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      reason,
      status: 'approved', // Auto-approve for simplicity
      createdAt: new Date().toISOString(),
      approvedBy: 'system',
    };

    const updatedRequests = [...existingLeaveRequests, newLeaveRequest];
    onLeaveRequestsChange(updatedRequests);

    // Reset form
    setSelectedStaff('');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
    setIsSubmitting(false);
    setActiveTab('manage');
  };

  const handleDeleteLeave = (leaveId: string) => {
    const updatedRequests = existingLeaveRequests.filter(leave => leave.id !== leaveId);
    onLeaveRequestsChange(updatedRequests);
  };

  const getStaffName = (staffId: string) => {
    return staff.find(s => s.id === staffId)?.name || 'Unknown Staff';
  };

  const getStatusIcon = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <X className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave Management</DialogTitle>
          <DialogDescription>
            Manage staff leave requests for the week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'manage')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Leave Request</TabsTrigger>
            <TabsTrigger value="manage">
              Manage Leaves 
              {currentWeekLeaves.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {currentWeekLeaves.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(leaveTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleCreateLeave}
              disabled={!selectedStaff || !startDate || !endDate || isSubmitting}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Leave Request'}
            </Button>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            {currentWeekLeaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leave requests for this week</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentWeekLeaves.map(leave => (
                  <Card key={leave.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{getStaffName(leave.staffId)}</CardTitle>
                          <Badge className={leaveTypeColors[leave.type]}>
                            {leaveTypeLabels[leave.type]}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(leave.status)}
                            <span className="text-sm text-muted-foreground capitalize">
                              {leave.status}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLeave(leave.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        {format(parseISO(leave.startDate), 'MMM d, yyyy')} - {format(parseISO(leave.endDate), 'MMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    {leave.reason && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{leave.reason}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 