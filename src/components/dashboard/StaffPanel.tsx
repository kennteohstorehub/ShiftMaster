'use client';

import { useAppContext } from '@/components/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StaffCard } from './StaffCard';
import { ScrollArea } from '../ui/scroll-area';
import { CalendarDays } from 'lucide-react';
import type { Staff, LeaveRequest } from '@/lib/types';

interface StaffPanelProps {
  leaveRequests?: LeaveRequest[];
  onOpenLeaveDialog?: () => void;
}

export default function StaffPanel({ leaveRequests = [], onOpenLeaveDialog }: StaffPanelProps) {
  const { staff } = useAppContext();

  return (
    <Card className="w-72 shrink-0 hidden lg:flex lg:flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff Members</CardTitle>
          {onOpenLeaveDialog && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenLeaveDialog}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Leave
            </Button>
          )}
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="space-y-2">
            {staff.map(staffMember => (
            <StaffCard 
              key={staffMember.id} 
              staff={staffMember}
              leaveRequests={leaveRequests}
            />
            ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
