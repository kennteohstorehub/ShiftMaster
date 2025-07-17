'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Staff, LeaveRequest } from '@/lib/types';
import { cn, generateInitials } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

interface StaffCardProps {
  staff: Staff;
  leaveRequests?: LeaveRequest[];
}

export function StaffCard({ staff, leaveRequests = [] }: StaffCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: staff.id,
    data: {
      type: 'staff',
      staff,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Check if staff has active leave this week
  const currentWeekStart = startOfWeek(new Date());
  const currentWeekEnd = endOfWeek(new Date());
  const currentWeekLeave = leaveRequests.find(leave => 
    leave.staffId === staff.id && 
    leave.status === 'approved' &&
    (isWithinInterval(parseISO(leave.startDate), { start: currentWeekStart, end: currentWeekEnd }) ||
     isWithinInterval(parseISO(leave.endDate), { start: currentWeekStart, end: currentWeekEnd }) ||
     (parseISO(leave.startDate) <= currentWeekStart && parseISO(leave.endDate) >= currentWeekEnd))
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg border bg-card shadow-sm cursor-grab active:cursor-grabbing transition-base hover-lift focus-ring',
        isDragging && 'opacity-30'
      )}
    >
      <Avatar>
        <AvatarImage src={staff.avatar} alt={staff.name} data-ai-hint="person face" />
        <AvatarFallback>{generateInitials(staff.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{staff.name}</p>
          {currentWeekLeave && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
              On Leave
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1" title={staff.skills.join(', ')}>
            {staff.skills.join(', ')}
        </p>
      </div>
    </div>
  );
}
