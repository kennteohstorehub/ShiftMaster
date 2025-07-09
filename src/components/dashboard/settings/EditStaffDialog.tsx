'use client';

import React from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/components/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Staff } from '@/lib/types';

interface EditStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
}

export function EditStaffDialog({ open, onOpenChange, staff }: EditStaffDialogProps) {
    const { addStaff, updateStaff } = useAppContext();
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (data.name && data.availability && data.skills) {
            const staffData = {
                name: data.name as string,
                avatar: (data.avatar as string) || `https://placehold.co/40x40/cccccc/FFFFFF.png?text=${(data.name as string).charAt(0)}`,
                skills: (data.skills as string).split(',').map(s => s.trim()),
                availability: data.availability as string,
            }
            if (staff) {
                updateStaff({ ...staffData, id: staff.id });
                toast({ title: "Staff Updated", description: `${staff.name} has been updated.` });
            } else {
                addStaff(staffData);
                toast({ title: "Staff Added", description: `${data.name} has been added.` });
            }
            onOpenChange(false);
        } else {
             toast({ title: "Error", description: "Please fill out all fields.", variant: "destructive" });
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
          <DialogDescription>
            {staff ? `Update details for ${staff.name}.` : 'Add a new staff member to your team.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" name="name" defaultValue={staff?.name} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="avatar" className="text-right">Avatar URL</Label>
                    <Input id="avatar" name="avatar" defaultValue={staff?.avatar} placeholder="https://placehold.co/40x40.png" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="skills" className="text-right pt-2">Skills</Label>
                    <Textarea id="skills" name="skills" defaultValue={staff?.skills.join(', ')} placeholder="Comma-separated skills" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="availability" className="text-right">Availability</Label>
                    <Input id="availability" name="availability" defaultValue={staff?.availability} placeholder="e.g. Mon-Fri 9AM-5PM" className="col-span-3" required />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">{staff ? 'Save Changes' : 'Create Staff'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
