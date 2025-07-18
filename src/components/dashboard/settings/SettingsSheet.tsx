'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffSettings } from "./StaffSettings";
import { UserManagement } from "./UserManagement";
import { useAuth } from "@/hooks/useAuth";

export function SettingsSheet({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your application settings and configuration.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Tabs defaultValue="staff" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="staff">Staff Management</TabsTrigger>
              <TabsTrigger value="users" disabled={!isSuperAdmin}>
                User Access
              </TabsTrigger>
            </TabsList>
            <TabsContent value="staff" className="space-y-4">
              <StaffSettings />
            </TabsContent>
            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
