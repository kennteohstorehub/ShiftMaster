'use client';

import { useAppContext } from '@/components/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StaffCard } from './StaffCard';
import { ScrollArea } from '../ui/scroll-area';
import type { Staff } from '@/lib/types';

export default function StaffPanel() {
  const { staff } = useAppContext();

  return (
    <Card className="w-72 shrink-0 hidden lg:flex lg:flex-col">
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="space-y-2">
            {staff.map(staffMember => (
            <StaffCard 
              key={staffMember.id} 
              staff={staffMember}
            />
            ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
