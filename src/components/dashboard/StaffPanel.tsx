'use client';

import { useAppContext } from '@/components/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StaffCard } from './StaffCard';
import { ScrollArea } from '../ui/scroll-area';
import { CalendarDays } from 'lucide-react';
import type { Staff, LeaveRequest } from '@/lib/types';
import { SkeletonCard } from '@/components/ui/skeleton-loader';

interface StaffPanelProps {
  leaveRequests?: LeaveRequest[];
  onOpenLeaveDialog?: () => void;
}

export default function StaffPanel({ leaveRequests = [], onOpenLeaveDialog }: StaffPanelProps) {
  const { staff } = useAppContext();

  return (
    <Card className="w-full h-full flex flex-col">
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
            {staff.length === 0 ? (
              // Show skeleton loaders while loading
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : (
              staff.map(staffMember => (
                <StaffCard 
                  key={staffMember.id} 
                  staff={staffMember}
                  leaveRequests={leaveRequests}
                />
              ))
            )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
