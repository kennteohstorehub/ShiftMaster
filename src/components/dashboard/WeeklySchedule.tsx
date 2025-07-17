'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/components/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, ChevronLeft, ChevronRight, ChevronsUpDown, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Shift, Staff, Role, LeaveRequest } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { CustomizeScheduleDialog } from './CustomizeScheduleDialog';
import {
  format,
  add,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { generateInitials } from '@/lib/utils';
import { SkeletonSchedule } from '@/components/ui/skeleton-loader';
import { useIsMobile } from '@/hooks/use-mobile';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullWeekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shiftTimes = ["09:00-18:00", "11:00-20:00", "12:00-21:00"];

const roleStyles: { [key: string]: { bg: string; text: string; border: string; legend: string } } = {
  'role-1': { bg: 'bg-chart-1/10', text: 'text-chart-1', border: 'border-chart-1/50', legend: 'bg-chart-1' },
  'role-2': { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-chart-2/50', legend: 'bg-chart-2' },
  'role-3': { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-chart-3/50', legend: 'bg-chart-3' },
};

function DraggableAssignedShift({ shift, staffMember, roleStyle }: { shift: Shift; staffMember: Staff, roleStyle: any }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: shift.id,
        data: {
            type: 'shift',
            shift,
        },
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: shift.id,
        data: {
            type: 'shift',
            shift,
            slot: { day: shift.day, roleId: shift.roleId, startTime: shift.startTime, endTime: shift.endTime },
        }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    if (isDragging) {
      return <div ref={setNodeRef} className="h-[42px] rounded-md bg-muted/50" />;
    }

    return (
        <div ref={(node) => { setNodeRef(node); setDropRef(node); }} style={style} {...listeners} {...attributes}>
            <div className={cn(
                'flex items-center gap-2 p-1.5 rounded-md border shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md',
                roleStyle?.bg,
                roleStyle?.border,
                isOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
            )}>
                <Avatar className="h-6 w-6">
                    <AvatarImage src={staffMember.avatar} alt={staffMember.name} data-ai-hint="person face" />
                    <AvatarFallback>{generateInitials(staffMember.name)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium pr-1">{staffMember.name}</span>
            </div>
        </div>
    );
}

function DroppableEmptySlot({ slotInfo, roleStyle }: { slotInfo: any, roleStyle: any }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `empty-${slotInfo.day}-${slotInfo.roleId}-${slotInfo.startTime}-${slotInfo.uniqueId}`,
        data: {
            type: 'empty-slot',
            slot: slotInfo,
        },
    });

    return (
        <div ref={setNodeRef} className={cn(
            "h-[42px] rounded-md flex items-center justify-center border-2 border-dashed transition-all duration-200",
            roleStyle?.border,
            isOver ? 'bg-primary/20 border-primary scale-105 shadow-md' : 'bg-transparent hover:bg-accent/10'
        )}>
           <UserPlus className={cn("h-5 w-5 transition-all duration-200", roleStyle?.text, "opacity-50", isOver && "opacity-100 scale-110")} />
        </div>
    );
}


interface WeeklyScheduleProps {
  leaveRequests?: LeaveRequest[];
  currentWeekStart?: Date;
}

export default function WeeklySchedule({ leaveRequests = [], currentWeekStart }: WeeklyScheduleProps) {
  const { shifts, staff, roles, generateSchedule } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCustomizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleGenerateSchedule = async (optionsOrRules: { customRules?: string, days?: number[] } | string) => {
    let options: { customRules?: string, days?: number[] };
    if (typeof optionsOrRules === 'string') {
        options = { customRules: optionsOrRules };
    } else {
        options = optionsOrRules;
    }

    setIsLoading(true);
    setAiReasoning('');
    setCustomizeDialogOpen(false);
    const result = await generateSchedule({
      ...options,
      leaveRequests,
      weekStartDate: currentWeekStart ? format(currentWeekStart, 'yyyy-MM-dd') : undefined
    });
    setIsLoading(false);

    if (result.success && result.data) {
      setAiReasoning(result.data.reasoning);
      toast({ title: "Schedule Generated!", description: "The AI has created a new weekly schedule." });
    } else {
      toast({ title: "Generation Failed", description: result.error || "An unknown error occurred.", variant: "destructive" });
    }
  };
  
  const shiftsByDay = useMemo(() => {
    const map: { [key: number]: Shift[] } = {};
    shifts.forEach(shift => {
      if (!map[shift.day]) map[shift.day] = [];
      map[shift.day].push(shift);
    });
    return map;
  }, [shifts]);

  const daysForView = useMemo(() => {
    if (view === 'daily') return [currentDate];
    if (view === 'weekly') return eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) });
    if (view === 'monthly') {
       const firstDay = startOfMonth(currentDate);
       const lastDay = endOfMonth(currentDate);
       return eachDayOfInterval({ start: startOfWeek(firstDay), end: endOfWeek(lastDay) });
    }
    return [];
  }, [view, currentDate]);

  const prev = () => {
    if (view === 'daily') setCurrentDate(add(currentDate, { days: -1 }));
    if (view === 'weekly') setCurrentDate(add(currentDate, { weeks: -1 }));
    if (view === 'monthly') setCurrentDate(add(currentDate, { months: -1 }));
  };

  const next = () => {
    if (view === 'daily') setCurrentDate(add(currentDate, { days: 1 }));
    if (view === 'weekly') setCurrentDate(add(currentDate, { weeks: 1 }));
    if (view === 'monthly') setCurrentDate(add(currentDate, { months: 1 }));
  };

  // Mobile card view for daily schedule
  const renderMobileView = () => {
    const dayShifts = shiftsByDay[currentDate.getDay()] || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{format(currentDate, 'EEEE, MMMM d')}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {roles.map(role => (
          <div key={role.id} className="space-y-2">
            <h4 className={cn("font-medium text-sm", roleStyles[role.id]?.text)}>
              {role.name}
            </h4>
            <div className="space-y-2">
              {shiftTimes.map(time => {
                const [startTime, endTime] = time.split('-');
                const roleShifts = dayShifts.filter(s => 
                  s.roleId === role.id && s.startTime === startTime && s.endTime === endTime
                );
                const emptySlotsCount = role.requiredAgents - roleShifts.length;
                
                return (
                  <Card key={time} className={cn("p-3", roleStyles[role.id]?.bg)}>
                    <p className="text-sm font-medium mb-2">{time}</p>
                    <div className="space-y-2">
                      {roleShifts.map(shift => {
                        const staffMember = staff.find(s => s.id === shift.staffId);
                        return staffMember ? (
                          <DraggableAssignedShift 
                            key={shift.id} 
                            shift={shift} 
                            staffMember={staffMember} 
                            roleStyle={roleStyles[role.id]} 
                          />
                        ) : null;
                      })}
                      {Array.from({ length: emptySlotsCount > 0 ? emptySlotsCount : 0 }).map((_, i) => (
                        <DroppableEmptySlot 
                          key={`${currentDate.getDay()}-${time}-${i}`} 
                          roleStyle={roleStyles[role.id]}
                          slotInfo={{
                            day: currentDate.getDay(),
                            roleId: role.id,
                            startTime,
                            endTime,
                            uniqueId: i,
                          }}
                        />
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeeklyView = () => (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm text-left table-fixed">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 font-semibold text-center sticky left-0 bg-muted/50 z-10 w-32">Role</th>
            {daysForView.map(day => (
              <th key={day.toString()} className="p-3 font-semibold text-center min-w-[240px]">{format(day, 'EEE, MMM d')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id} className="border-t">
              <td className={`p-3 font-bold text-center sticky left-0 bg-background z-10 border-r ${roleStyles[role.id]?.text}`}>
                {role.name}
              </td>
              {daysForView.map(day => {
                const dayIndex = day.getDay();
                
                return (
                  <td key={day.toString()} className="p-3 align-top border-l min-h-[150px]">
                    <div className="space-y-3">
                      {shiftTimes.map(time => {
                        const [startTime, endTime] = time.split('-');
                        const dayShifts = shiftsByDay[dayIndex] || [];
                        const assignedShifts = dayShifts.filter(s => s.roleId === role.id && s.startTime === startTime && s.endTime === endTime);
                        const emptySlotsCount = role.requiredAgents - assignedShifts.length;
                        
                        return (
                          <div key={time}>
                            <p className="font-semibold text-xs text-muted-foreground mb-1.5">{time}</p>
                            <div className="space-y-1">
                                {assignedShifts.map((shift) => {
                                    const staffMember = staff.find(s => s.id === shift.staffId);
                                    return staffMember ? <DraggableAssignedShift key={shift.id} shift={shift} staffMember={staffMember} roleStyle={roleStyles[role.id]} /> : null
                                })}
                                {Array.from({ length: emptySlotsCount > 0 ? emptySlotsCount : 0 }).map((_, i) => (
                                    <DroppableEmptySlot 
                                        key={`${dayIndex}-${time}-${i}`} 
                                        roleStyle={roleStyles[role.id]}
                                        slotInfo={{
                                            day: dayIndex,
                                            roleId: role.id,
                                            startTime,
                                            endTime,
                                            uniqueId: i,
                                        }}
                                    />
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  const renderMonthlyView = () => (
     <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50">
            {weekDays.map(day => (
                <div key={day} className="p-2 text-center font-semibold">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-5">
            {daysForView.map(day => {
                const dayIndex = day.getDay();
                const dayShifts = shiftsByDay[dayIndex] || [];
                return (
                    <div key={day.toString()} className={cn("p-2 border-r border-t h-48 overflow-y-auto",
                        { "bg-muted/30 text-muted-foreground": !isSameMonth(day, currentDate) },
                        { "relative": isToday(day) }
                    )}>
                        {isToday(day) && <div className="absolute top-1 right-1 bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center rounded-full text-xs">{format(day, 'd')}</div>}
                        <span className={cn("font-semibold", { "text-primary": isToday(day) })}>{format(day, 'd')}</span>
                        <div className="mt-1 space-y-1">
                          {roles.map(role => {
                            const roleShifts = dayShifts.filter(s => s.roleId === role.id);
                            return roleShifts.length > 0 && (
                                <div key={role.id}>
                                    {roleShifts.map(shift => {
                                        const staffMember = staff.find(s => s.id === shift.staffId);
                                        return staffMember && (
                                            <div key={shift.id} className={cn("flex items-center gap-1.5 text-xs rounded p-0.5", roleStyles[role.id]?.bg, roleStyles[role.id]?.text)}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${roleStyles[role.id]?.legend}`} />
                                                <span>{staffMember.name.split(' ')[0]}</span>
                                                <span className='opacity-70'>({shift.startTime.slice(0,2)}-{shift.endTime.slice(0,2)})</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                          })}
                        </div>
                    </div>
                )
            })}
        </div>
     </div>
  );


  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <div className="flex items-center gap-4">
                    <CardTitle className="text-2xl font-bold">
                        {view === 'monthly' ? format(currentDate, 'MMMM yyyy') : 
                         view === 'weekly' ? `Week of ${format(startOfWeek(currentDate), 'MMM d')}` : 
                         format(currentDate, 'eeee, MMMM d')}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
                <CardDescription>Drag staff from the left panel to assign them to a shift.</CardDescription>
                <div className="flex items-center gap-6 mt-4">
                    <p className="text-sm font-semibold">Legend:</p>
                    {roles.map(role => (
                        <div key={role.id} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${roleStyles[role.id]?.legend || 'bg-muted'}`} />
                            <span className="text-sm text-muted-foreground">{role.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col items-end gap-4">
                 {!isMobile && (
                   <RadioGroup defaultValue="weekly" onValueChange={(v) => setView(v as any)} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="daily" id="daily" /><Label htmlFor="daily">Daily</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="weekly" id="weekly" /><Label htmlFor="weekly">Weekly</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="monthly" id="monthly" /><Label htmlFor="monthly">Monthly</Label></div>
                   </RadioGroup>
                 )}
                <div className="flex rounded-md shadow-sm">
                    <Button onClick={() => handleGenerateSchedule({})} disabled={isLoading} size="lg" className="rounded-r-none">
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                        {shifts.length > 0 ? 'Regenerate' : 'Generate AI Schedule'}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="lg" className="rounded-l-none border-l px-2" disabled={isLoading}>
                                <ChevronsUpDown className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Generate Schedule For</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleGenerateSchedule({})}>
                                Entire Week
                            </DropdownMenuItem>
                            {fullWeekDays.map((day, index) => (
                                <DropdownMenuItem key={day} onClick={() => handleGenerateSchedule({ days: [index] })}>
                                    {day}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setCustomizeDialogOpen(true)}>
                                Customize Rules & Generate...
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {aiReasoning && (
             <Alert className="mb-6 bg-primary/10 border-primary/50">
                <Sparkles className="h-4 w-4 !text-primary" />
                <AlertTitle className="text-primary font-semibold">AI Scheduling Analysis</AlertTitle>
                <AlertDescription className="text-primary/90">
                    {aiReasoning}
                </AlertDescription>
            </Alert>
        )}
        {isLoading ? (
          <SkeletonSchedule />
        ) : isMobile ? (
          renderMobileView()
        ) : (
          view === 'weekly' || view === 'daily' ? renderWeeklyView() : renderMonthlyView()
        )}
      </CardContent>
      {shifts.length === 0 && !isLoading && (
        <CardContent>
            <div className='text-center p-8 text-muted-foreground'>
                Your schedule is empty. <br/>Click the &quot;Generate AI Schedule&quot; button to begin.
            </div>
        </CardContent>
      )}
    </Card>
    <CustomizeScheduleDialog
        open={isCustomizeDialogOpen}
        onOpenChange={setCustomizeDialogOpen}
        onGenerate={handleGenerateSchedule}
        isGenerating={isLoading}
    />
    </>
  );
}
