'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { StaffSettings } from "./StaffSettings";

export function SettingsSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your application settings. Configure staff members.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <StaffSettings />
        </div>
      </SheetContent>
    </Sheet>
  )
}
