'use client';

import StaffPanel from '@/components/dashboard/StaffPanel';
import WeeklySchedule from '@/components/dashboard/WeeklySchedule';
import { LeaveManagementDialog } from '@/components/dashboard/LeaveManagementDialog';
import { DndContext, type DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { useAppContext } from '@/components/AppContext';
import { v4 as uuidv4 } from 'uuid';
import type { Shift, Staff, LeaveRequest } from '@/lib/types';
import { useState } from 'react';
import { cn, generateInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { startOfWeek } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { InlineMessage } from '@/components/ui/inline-message';
import { useToast } from '@/hooks/use-toast';

// This is the component that will be rendered as an overlay while dragging
function DraggableStaffCard({ staff }: { staff: Staff }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg border bg-card shadow-lg cursor-grabbing'
      )}
    >
      <Avatar>
        <AvatarImage src={staff.avatar} alt={staff.name} data-ai-hint="person face" />
        <AvatarFallback>{generateInitials(staff.name)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{staff.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">
            {staff.skills.join(', ')}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { staff, shifts, setShifts } = useAppContext();
  const [activeDragStaff, setActiveDragStaff] = useState<Staff | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [currentWeekStart] = useState(startOfWeek(new Date()));
  const [mobileStaffPanelOpen, setMobileStaffPanelOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type === 'staff') {
      setActiveDragStaff(active.data.current.staff);
    } else if (active.data.current?.type === 'shift') {
      const staffMember = staff.find(s => s.id === active.data.current.shift.staffId);
      if (staffMember) setActiveDragStaff(staffMember);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragStaff(null);
    const { active, over } = event;

    const activeIsShift = active.data.current?.type === 'shift';

    // A shift is dropped outside of any valid area, so remove it.
    if (!over && activeIsShift) {
        const draggedShift = active.data.current?.shift as Shift;
        if (draggedShift) {
          setShifts(prev => prev.filter(s => s.id !== draggedShift.id));
        }
        return;
    }

    if (!over) return; // Dropped outside a droppable area

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return; // Dropped on itself

    const activeIsStaff = active.data.current?.type === 'staff';
    
    const overIsShift = over.data.current?.type === 'shift';
    const overIsEmptySlot = over.data.current?.type === 'empty-slot';

    if (!overIsShift && !overIsEmptySlot) return;

    const overData = over.data.current?.slot;
    if (!overData) return;

    // Case 1: Drag staff from panel to a slot
    if (activeIsStaff) {
      const draggedStaffId = active.data.current?.staff?.id;
      if (!draggedStaffId) return;
      
      // Sub-case 1a: Drop on an empty slot -> Create new shift
      if (overIsEmptySlot) {
        const newShift: Shift = {
          id: `shift-${uuidv4()}`,
          staffId: draggedStaffId,
          ...overData,
        };
        setShifts(prev => [...prev, newShift]);
        const staffName = staff.find(s => s.id === draggedStaffId)?.name || 'Staff';
        setFeedbackMessage({ type: 'success', message: `${staffName} assigned to shift` });
        setTimeout(() => setFeedbackMessage(null), 3000);
        return;
      }
      
      // Sub-case 1b: Drop on a filled slot -> Replace staff
      if (overIsShift) {
        const targetShift = over.data.current?.shift;
        if (targetShift) {
          setShifts(prev => prev.map(s => s.id === targetShift.id ? { ...s, staffId: draggedStaffId } : s));
          const staffName = staff.find(s => s.id === draggedStaffId)?.name || 'Staff';
          setFeedbackMessage({ type: 'success', message: `${staffName} replaced in shift` });
          setTimeout(() => setFeedbackMessage(null), 3000);
        }
        return;
      }
    }

    // Case 2: Drag a shift from the schedule
    if (activeIsShift) {
        const draggedShift = active.data.current?.shift as Shift;
        if (!draggedShift) return;
        
        // Sub-case 2a: Drop on another filled slot -> Swap staff
        if (overIsShift) {
            const targetShift = over.data.current?.shift as Shift;
            if (!targetShift) return;
            
            // Prevent swapping with self
            if (draggedShift.id === targetShift.id) return;
            
            setShifts(prevShifts => {
                const newShifts = [...prevShifts];
                const draggedIndex = newShifts.findIndex(s => s.id === draggedShift.id);
                const targetIndex = newShifts.findIndex(s => s.id === targetShift.id);
                
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    const tempStaffId = newShifts[draggedIndex].staffId;
                    newShifts[draggedIndex].staffId = newShifts[targetIndex].staffId;
                    newShifts[targetIndex].staffId = tempStaffId;
                }
                return newShifts;
            });
            return;
        }

        // Sub-case 2b: Drop on an empty slot -> Move shift
        if (overIsEmptySlot) {
             setShifts(prevShifts => {
                const updatedShifts = prevShifts.map(s => {
                    if (s.id === draggedShift.id) {
                        return { ...s, ...overData };
                    }
                    return s;
                });
                return updatedShifts;
            });
            return;
        }
    }
  };


  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-row w-full h-full relative">
        {/* Desktop Staff Panel */}
        {!isMobile && (
          <StaffPanel 
            leaveRequests={leaveRequests}
            onOpenLeaveDialog={() => setLeaveDialogOpen(true)}
          />
        )}
        
        {/* Mobile Staff Panel Sheet */}
        {isMobile && (
          <Sheet open={mobileStaffPanelOpen} onOpenChange={setMobileStaffPanelOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover-lift"
              >
                <Users className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <StaffPanel 
                leaveRequests={leaveRequests}
                onOpenLeaveDialog={() => {
                  setLeaveDialogOpen(true);
                  setMobileStaffPanelOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        )}
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {feedbackMessage && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2">
              <InlineMessage
                variant={feedbackMessage.type}
                message={feedbackMessage.message}
                onClose={() => setFeedbackMessage(null)}
              />
            </div>
          )}
          <WeeklySchedule 
            leaveRequests={leaveRequests}
            currentWeekStart={currentWeekStart}
          />
        </div>
      </div>
      <DragOverlay>
        {activeDragStaff ? <DraggableStaffCard staff={activeDragStaff} /> : null}
      </DragOverlay>
      
      <LeaveManagementDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        staff={staff}
        currentWeekStart={currentWeekStart}
        onLeaveRequestsChange={setLeaveRequests}
        existingLeaveRequests={leaveRequests}
      />
    </DndContext>
  );
}
