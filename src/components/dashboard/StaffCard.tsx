'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Staff } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';

export function StaffCard({ staff }: { staff: Staff }) {
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


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg border bg-card shadow-sm cursor-grab active:cursor-grabbing hover:bg-accent/50',
        isDragging && 'opacity-30'
      )}
    >
      <Avatar>
        <AvatarImage src={staff.avatar} alt={staff.name} data-ai-hint="person face" />
        <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{staff.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1" title={staff.skills.join(', ')}>
            {staff.skills.join(', ')}
        </p>
      </div>
    </div>
  );
}
