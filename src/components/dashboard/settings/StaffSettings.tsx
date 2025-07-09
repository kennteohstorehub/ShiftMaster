'use client';

import React from 'react';
import { useAppContext } from '@/components/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateInitials } from '@/lib/utils';
import { PlusCircle, Trash2, Edit, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Staff } from '@/lib/types';
import { EditStaffDialog } from './EditStaffDialog';

export function StaffSettings() {
    const { staff, deleteStaff } = useAppContext();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);

    const handleAdd = () => {
        setSelectedStaff(null);
        setDialogOpen(true);
    };

    const handleEdit = (staffMember: Staff) => {
        setSelectedStaff(staffMember);
        setDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Staff</CardTitle>
                        <CardDescription>Add, edit, or remove staff members.</CardDescription>
                    </div>
                    <Button onClick={handleAdd} size="sm">
                        <PlusCircle className="mr-2" /> Add Staff
                    </Button>
                </div>
            </CardHeader>
            <div className="p-6 pt-0 space-y-2">
                {staff.map((staffMember) => (
                    <div key={staffMember.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={staffMember.avatar} data-ai-hint="person face" />
                                <AvatarFallback>{generateInitials(staffMember.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{staffMember.name}</p>
                                <p className="text-sm text-muted-foreground">{staffMember.skills.join(', ')}</p>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(staffMember)}>
                                    <Edit className="mr-2" /> Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete {staffMember.name}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteStaff(staffMember.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
            <EditStaffDialog open={dialogOpen} onOpenChange={setDialogOpen} staff={selectedStaff} />
        </Card>
    );
}
