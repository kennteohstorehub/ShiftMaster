'use client';

import { Bot, Cog } from 'lucide-react';
import { SettingsSheet } from './settings/SettingsSheet';
import { Button } from '../ui/button';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              ShiftMaster
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SettingsSheet>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Cog className="h-6 w-6 text-foreground/80" />
              </Button>
            </SettingsSheet>
          </div>
        </div>
      </div>
    </header>
  );
}
